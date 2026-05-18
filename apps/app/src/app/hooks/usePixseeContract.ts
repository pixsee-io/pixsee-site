"use client";

/**
 * usePixseeContract
 *
 * Handles all on-chain interactions for Pixsee:
 *   - Checking episode access
 *   - Getting USDC cost to watch
 *   - Buy + unlock (single episode or batch)
 *   - Creating a show (for creators)
 *   - Getting show contract addresses from factory
 *
 * All reads go through a public viem client (no wallet needed).
 * All writes go through the user's Privy wallet.
 */

import { useState, useCallback } from "react";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import {
  toEventHash,
  decodeEventLog,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatUnits,
  maxUint256,
  type Address,
  type Hash,
} from "viem";

import { baseSepolia } from "viem/chains";
import {
  BASE_SEPOLIA_RPC,
  BONDING_CURVE_ABI,
  CONTRACT_ADDRESSES,
  ERC20_ABI,
  ROUTER_ABI,
  SHOW_CONTRACT_ABI,
  SHOW_FACTORY_ABI,
  SHOW_FEE_DISTRIBUTOR_ABI,
} from "../lib/pixsee-contracts";

//  Types

export type ShowInfo = {
  creator: Address;
  tix: Address;
  feeDistributor: Address;
  bondingCurve: Address;
  showContract: Address;
  title: string;
  tickName: string;
  tickSymbol: string;
  curveTier: number;
  createdAt: bigint;
};

export type CurveTier = 0 | 1 | 2; // 0=Conservative 1=Balanced 2=Aggressive

//  Public client (reads — no wallet needed)

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC),
});

import type { TransactionReceipt } from "viem";

// Minimal interface — only the one method we actually call.
type ReceiptClient = {
  getTransactionReceipt: (args: { hash: Hash }) => Promise<TransactionReceipt | null>;
};

// ── Approval cache (localStorage) ───────────────────────────────────────────
// Stores token:spender pairs that have been approved with maxUint256 so we
// can skip the on-chain allowance check (and the wallet popup) on future txs.
// Key format: pixsee_approvals_{walletAddress}
// Value: JSON array of "tokenAddress:spenderAddress" strings (lowercased).

function approvalCacheKey(wallet: string) {
  return `pixsee_approvals_${wallet.toLowerCase()}`;
}

export function isApprovalCached(wallet: string, token: string, spender: string): boolean {
  try {
    const raw = localStorage.getItem(approvalCacheKey(wallet));
    if (!raw) return false;
    const entries: string[] = JSON.parse(raw);
    return entries.includes(`${token.toLowerCase()}:${spender.toLowerCase()}`);
  } catch {
    return false;
  }
}

function cacheApproval(wallet: string, token: string, spender: string): void {
  try {
    const key = approvalCacheKey(wallet);
    const raw = localStorage.getItem(key);
    const entries: string[] = raw ? JSON.parse(raw) : [];
    const entry = `${token.toLowerCase()}:${spender.toLowerCase()}`;
    if (!entries.includes(entry)) {
      entries.push(entry);
      localStorage.setItem(key, JSON.stringify(entries));
    }
  } catch {
    // localStorage unavailable (SSR or private mode) — no-op
  }
}

// Polls multiple RPC clients in round-robin until any returns a receipt.
// More resilient than waitForTransactionReceipt when MetaMask submits through
// a slow/restrictive node (e.g. Infura's Base Sepolia endpoint) that takes
// 30–120s to propagate to other nodes.
async function waitForReceiptResilient(
  hash: Hash,
  clients: ReceiptClient[],
  opts = { timeoutMs: 300_000, pollIntervalMs: 2_000 }
) {
  const start = Date.now();
  while (Date.now() - start < opts.timeoutMs) {
    for (const client of clients) {
      try {
        const receipt = await client.getTransactionReceipt({ hash });
        if (receipt) return receipt;
      } catch {
        // not found on this client yet — try next
      }
    }
    await new Promise((r) => setTimeout(r, opts.pollIntervalMs));
  }
  throw new Error(
    `Transaction ${hash} was not confirmed after ${opts.timeoutMs / 1_000}s. ` +
      "Check the explorer — it may still confirm. " +
      "If MetaMask is on a slow RPC, switch its Base Sepolia RPC to " +
      "https://base-sepolia-rpc.publicnode.com in MetaMask Settings → Networks → Base Sepolia → RPC URL."
  );
}

//  Hook ─

export function usePixseeContract() {
  const { wallets } = useWallets();
  usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefer the Privy embedded wallet for the current user.
  // Privy wallets have walletClientType === "privy".
  // Fall back to the first available wallet (e.g. MetaMask-only users).
  const activeWallet =
    wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];

  // Gets the wallet client for signing transactions.
  // Switches the wallet to Base Sepolia first, regardless of which chain it's on.
  const getWalletClient = useCallback(async () => {
    const wallet = activeWallet;
    if (!wallet) throw new Error("No wallet connected");

    // Switch chain — works from any network (Polygon, Ethereum, etc.)
    await wallet.switchChain(baseSepolia.id);

    const provider = await wallet.getEthereumProvider();

    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom(provider),
      account: wallet.address as Address,
    });

    // Verify the switch actually happened (some wallets are slow to confirm)
    const actualChainId = await walletClient.getChainId();
    if (actualChainId !== baseSepolia.id) {
      // Retry once
      await wallet.switchChain(baseSepolia.id);
      const chainAfterRetry = await walletClient.getChainId();
      if (chainAfterRetry !== baseSepolia.id) {
        throw new Error(
          `Please switch your wallet to Base Sepolia (chain ${baseSepolia.id}). Currently on chain ${chainAfterRetry}.`
        );
      }
    }

    // Give MetaMask's injected provider ~500ms to fully warm up its RPC
    // connection after a chain switch before we send the first transaction.
    await new Promise((r) => setTimeout(r, 500));

    // A public client backed by the same provider so receipt polling
    // uses the same RPC node that the wallet submitted through.
    // This prevents timeout when MetaMask submits via sepolia.base.org
    // but the global publicClient polls publicnode.com (different nodes,
    // slow cross-node propagation).
    const providerPublicClient = createPublicClient({
      chain: baseSepolia,
      transport: custom(provider),
    });

    return { walletClient, providerPublicClient };
  }, [activeWallet]);

  const walletAddress = activeWallet?.address as Address | undefined;

  //  READ: Check if viewer has access to an episode ─

  const checkAccess = useCallback(
    async (
      showContractAddress: Address,
      episodeId: number
    ): Promise<boolean> => {
      if (!walletAddress) return false;
      try {
        const result = await publicClient.readContract({
          address: showContractAddress,
          abi: SHOW_CONTRACT_ABI,
          functionName: "hasAccess",
          args: [walletAddress, BigInt(episodeId)],
        });
        return Boolean(result);
      } catch {
        return false;
      }
    },
    [walletAddress]
  );

  //  READ: Get USDC cost to watch N seconds ─

  const quoteCostToWatch = useCallback(
    async (
      bondingCurveAddress: Address,
      durationSeconds: number
    ): Promise<{ usdcCost: bigint; fee: bigint; displayCost: string }> => {
      const [usdcCost, fee] = (await publicClient.readContract({
        address: bondingCurveAddress,
        abi: BONDING_CURVE_ABI,
        functionName: "quoteCostToWatch",
        args: [BigInt(durationSeconds)],
      })) as [bigint, bigint];
      return {
        usdcCost,
        fee,
        displayCost: formatUnits(usdcCost, 6), // USDC has 6 decimals
      };
    },
    []
  );

  //  READ: Get show info from factory

  const getShowInfo = useCallback(async (showId: number): Promise<ShowInfo> => {
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.showFactory as Address,
      abi: [
        {
          name: "getShow",
          type: "function",
          stateMutability: "view",
          inputs: [{ name: "showId", type: "uint256" }],
          outputs: [
            {
              name: "",
              type: "tuple",
              components: [
                { name: "creator", type: "address" },
                { name: "tix", type: "address" },
                { name: "feeDistributor", type: "address" },
                { name: "bondingCurve", type: "address" },
                { name: "showContract", type: "address" },
                { name: "title", type: "string" },
                { name: "tickName", type: "string" },
                { name: "tickSymbol", type: "string" },
                { name: "curveTier", type: "uint8" },
                { name: "createdAt", type: "uint256" },
              ],
            },
          ],
        },
      ] as const,
      functionName: "getShow",
      args: [BigInt(showId)],
    });
    return result as ShowInfo;
  }, []);

  //  READ: Get curve state (for displaying price info) ─

  const getCurveState = useCallback(async (bondingCurveAddress: Address) => {
    const result = await publicClient.readContract({
      address: bondingCurveAddress,
      abi: BONDING_CURVE_ABI,
      functionName: "getCurveState",
    });
    const [
      spotPricePerToken,
      spotPricePerMinute,
      ,
      totalVolumeUsdc,
      supply,
      reserve,
    ] = result as bigint[];
    return {
      spotPricePerToken,
      spotPricePerMinute,
      // Display-friendly: price per minute in USDC
      pricePerMinuteDisplay: formatUnits(spotPricePerMinute, 6),
      totalVolumeUsdc,
      volumeDisplay: formatUnits(totalVolumeUsdc, 6),
      supply,
      reserve,
    };
  }, []);

  //  WRITE: Approve USDC then buy+unlock single episode
  //
  // Flow:
  //   1. Check current USDC allowance for router
  //   2. If insufficient, approve (one tx)
  //   3. Call router.buyAndUnlock (one tx)
  //
  // Returns tx hash of the unlock tx.

  const buyAndUnlock = useCallback(
    async ({
      showContractAddress,
      bondingCurveAddress,
      episodeId,
      durationSeconds,
    }: {
      showContractAddress: Address;
      bondingCurveAddress: Address;
      episodeId: number;
      durationSeconds: number;
    }): Promise<Hash | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { walletClient, providerPublicClient } = await getWalletClient();

        const { usdcCost } = await quoteCostToWatch(
          bondingCurveAddress,
          durationSeconds
        );
        const usdcWithSlippage = (usdcCost * BigInt(102)) / BigInt(100);

        if (!isApprovalCached(walletAddress, CONTRACT_ADDRESSES.usdc, CONTRACT_ADDRESSES.router)) {
          const currentAllowance = await providerPublicClient.readContract({
            address: CONTRACT_ADDRESSES.usdc as Address,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [walletAddress, CONTRACT_ADDRESSES.router as Address],
          });
          if ((currentAllowance as bigint) < usdcWithSlippage) {
            const approveTx = await walletClient.writeContract({
              address: CONTRACT_ADDRESSES.usdc as Address,
              abi: ERC20_ABI,
              functionName: "approve",
              args: [CONTRACT_ADDRESSES.router as Address, maxUint256],
              gas: 100_000n,
            });
            await waitForReceiptResilient(approveTx, [providerPublicClient, publicClient]);
          }
          cacheApproval(walletAddress, CONTRACT_ADDRESSES.usdc, CONTRACT_ADDRESSES.router);
        }

        const unlockTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.router as Address,
          abi: ROUTER_ABI,
          functionName: "buyAndUnlock",
          args: [showContractAddress, BigInt(episodeId), usdcWithSlippage, 0n],
          gas: 1_000_000n,
        });

        await waitForReceiptResilient(unlockTx, [providerPublicClient, publicClient]);
        return unlockTx;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient, quoteCostToWatch]
  );

  const buyAndUnlockBatch = useCallback(
    async ({
      showContractAddress,
      bondingCurveAddress,
      episodeIds,
      totalDurationSeconds,
    }: {
      showContractAddress: Address;
      bondingCurveAddress: Address;
      episodeIds: number[];
      totalDurationSeconds: number;
    }): Promise<Hash | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { walletClient, providerPublicClient } = await getWalletClient();

        const { usdcCost } = await quoteCostToWatch(
          bondingCurveAddress,
          totalDurationSeconds
        );
        const usdcWithSlippage = (usdcCost * BigInt(102)) / BigInt(100);

        if (!isApprovalCached(walletAddress, CONTRACT_ADDRESSES.usdc, CONTRACT_ADDRESSES.router)) {
          const currentAllowance = await providerPublicClient.readContract({
            address: CONTRACT_ADDRESSES.usdc as Address,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [walletAddress, CONTRACT_ADDRESSES.router as Address],
          });
          if ((currentAllowance as bigint) < usdcWithSlippage) {
            const approveTx = await walletClient.writeContract({
              address: CONTRACT_ADDRESSES.usdc as Address,
              abi: ERC20_ABI,
              functionName: "approve",
              args: [CONTRACT_ADDRESSES.router as Address, maxUint256],
              gas: 100_000n,
            });
            await waitForReceiptResilient(approveTx, [providerPublicClient, publicClient]);
          }
          cacheApproval(walletAddress, CONTRACT_ADDRESSES.usdc, CONTRACT_ADDRESSES.router);
        }

        const unlockTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.router as Address,
          abi: ROUTER_ABI,
          functionName: "buyAndUnlockBatch",
          args: [
            showContractAddress,
            episodeIds.map(BigInt),
            usdcWithSlippage,
            0n,
          ],
          gas: 1_000_000n,
        });

        await waitForReceiptResilient(unlockTx, [providerPublicClient, publicClient]);
        return unlockTx;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Transaction failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient, quoteCostToWatch]
  );

  //  WRITE: Create a show (called from creator flow)
  //
  // Returns the showId emitted in the ShowCreated event.
  // The backend should also listen for this event to save contract addresses.

  const createShow = useCallback(
    async ({
      title,
      tickName,
      tickSymbol,
      creatorAddress,
      curveTier = 1,
    }: {
      title: string;
      tickName: string;
      tickSymbol: string;
      creatorAddress: Address;
      curveTier?: CurveTier;
    }): Promise<{ showId: bigint; showInfo: ShowInfo } | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { walletClient, providerPublicClient } = await getWalletClient();

        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.showFactory as Address,
          abi: SHOW_FACTORY_ABI,
          functionName: "createShow",
          args: [title, tickName, tickSymbol, creatorAddress, curveTier],
          chain: baseSepolia,
          gas: 3_000_000n,
        });

        const receipt = await waitForReceiptResilient(tx, [
          providerPublicClient,
          publicClient,
        ]);
        if (receipt.status === "reverted") {
          setError("Show creation transaction reverted");
          return null;
        }

        const SHOW_CREATED_TOPIC = toEventHash(
          "ShowCreated(uint256,address,string,string,string,uint8,address,address,address,address)"
        );

        const showCreatedLog = receipt.logs.find(
          (log) =>
            log.address.toLowerCase() ===
              CONTRACT_ADDRESSES.showFactory.toLowerCase() &&
            log.topics[0]?.toLowerCase() === SHOW_CREATED_TOPIC
        );

        if (!showCreatedLog || !showCreatedLog.topics[1]) {
          setError("Could not find ShowCreated event in transaction");
          return null;
        }

        const SHOW_CREATED_EVENT_ABI = [
          {
            type: "event",
            name: "ShowCreated",
            inputs: [
              { name: "showId", type: "uint256", indexed: true },
              { name: "creator", type: "address", indexed: true },
              { name: "title", type: "string", indexed: false },
              { name: "tickName", type: "string", indexed: false },
              { name: "tickSymbol", type: "string", indexed: false },
              { name: "curveTier", type: "uint8", indexed: false },
              { name: "tix", type: "address", indexed: false },
              { name: "feeDistributor", type: "address", indexed: false },
              { name: "bondingCurve", type: "address", indexed: false },
              { name: "showContract", type: "address", indexed: false },
            ],
          },
        ] as const;

        const decoded = decodeEventLog({
          abi: SHOW_CREATED_EVENT_ABI,
          data: showCreatedLog.data as `0x${string}`,
          topics: showCreatedLog.topics as [
            `0x${string}`,
            ...`0x${string}`[]
          ],
        });

        const showId = decoded.args.showId as bigint;

        const showInfo: ShowInfo = {
          creator: decoded.args.creator as Address,
          tix: decoded.args.tix as Address,
          feeDistributor: decoded.args.feeDistributor as Address,
          bondingCurve: decoded.args.bondingCurve as Address,
          showContract: decoded.args.showContract as Address,
          title: decoded.args.title as string,
          tickName: decoded.args.tickName as string,
          tickSymbol: decoded.args.tickSymbol as string,
          curveTier: decoded.args.curveTier as number,
          createdAt: 0n,
        };

        return { showId, showInfo };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Show creation failed";
        console.error("createShow error:", err);
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  const addEpisode = useCallback(
    async ({
      showContractAddress,
      durationSeconds,
      isFree,
    }: {
      showContractAddress: Address;
      durationSeconds: number;
      isFree: boolean;
    }): Promise<{ onChainEpisodeId: bigint } | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { walletClient, providerPublicClient } = await getWalletClient();

        const tx = await walletClient.writeContract({
          address: showContractAddress,
          abi: SHOW_CONTRACT_ABI,
          functionName: "addEpisode",
          args: [BigInt(durationSeconds), isFree],
          gas: 300_000n,
        });

        console.log("addEpisode tx hash:", tx);

        const receipt = await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);

        if (receipt.status === "reverted") {
          setError("addEpisode transaction reverted");
          return null;
        }

        // EpisodeAdded(uint256 indexed episodeId, uint256 durationSeconds, bool isFree)
        const EPISODE_ADDED_TOPIC = toEventHash(
          "EpisodeAdded(uint256,uint256,bool)"
        );

        const episodeAddedLog = receipt.logs.find(
          (log) =>
            log.address.toLowerCase() === showContractAddress.toLowerCase() &&
            log.topics[0]?.toLowerCase() === EPISODE_ADDED_TOPIC.toLowerCase()
        );

        if (!episodeAddedLog || !episodeAddedLog.topics[1]) {
          console.warn(
            "EpisodeAdded event not found, deriving episodeId from contract"
          );
          // Fallback: read episodeCount from contract
          const count = (await publicClient.readContract({
            address: showContractAddress,
            abi: [
              {
                name: "episodeCount",
                type: "function",
                stateMutability: "view",
                inputs: [],
                outputs: [{ name: "", type: "uint256" }],
              },
            ] as const,
            functionName: "episodeCount",
          })) as bigint;
          return { onChainEpisodeId: count };
        }

        const onChainEpisodeId = BigInt(episodeAddedLog.topics[1]);
        console.log(
          "Episode registered on-chain with id:",
          onChainEpisodeId.toString()
        );
        return { onChainEpisodeId };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "addEpisode failed";
        console.error("addEpisode error:", err);
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  //  READ: Get tix token address from a bonding curve ─

  const getTixAddress = useCallback(
    async (bondingCurveAddress: Address): Promise<Address> => {
      const result = await publicClient.readContract({
        address: bondingCurveAddress,
        abi: BONDING_CURVE_ABI,
        functionName: "tix",
      });
      return result as Address;
    },
    []
  );

  //  WRITE: Unlock episode using tix the user already holds ─
  //
  // Flow:
  //   1. Approve tix token for showContract (if allowance is insufficient)
  //   2. showContract.unlockEpisode(episodeId)
  //
  // No USDC involved — uses the viewer's existing tix balance.

  const unlockWithTix = useCallback(
    async ({
      showContractAddress,
      tixAddress,
      episodeId,
      durationSeconds,
    }: {
      showContractAddress: Address;
      tixAddress: Address;
      episodeId: number;
      durationSeconds: number;
    }): Promise<Hash | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { walletClient, providerPublicClient } = await getWalletClient();

        // Amount = durationSeconds × 1e18 tix-wei
        const tixAmount = BigInt(durationSeconds) * BigInt("1000000000000000000");

        if (!isApprovalCached(walletAddress, tixAddress, showContractAddress)) {
          const currentAllowance = await providerPublicClient.readContract({
            address: tixAddress,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [walletAddress, showContractAddress],
          });
          if ((currentAllowance as bigint) < tixAmount) {
            const approveTx = await walletClient.writeContract({
              address: tixAddress,
              abi: ERC20_ABI,
              functionName: "approve",
              args: [showContractAddress, maxUint256],
              gas: 100_000n,
            });
            await waitForReceiptResilient(approveTx, [providerPublicClient, publicClient]);
          }
          cacheApproval(walletAddress, tixAddress, showContractAddress);
        }

        const tx = await walletClient.writeContract({
          address: showContractAddress,
          abi: SHOW_CONTRACT_ABI,
          functionName: "unlockEpisode",
          args: [BigInt(episodeId)],
          gas: 300_000n,
        });

        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unlock failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  //  READ: Get USDC balance ─

  const getUsdcBalance = useCallback(async (): Promise<string> => {
    if (!walletAddress) return "0";
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.usdc as Address,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [walletAddress],
    });
    return formatUnits(balance as bigint, 6);
  }, [walletAddress]);

  //  READ: Get USDC balance as raw bigint ─

  const getUsdcBalanceRaw = useCallback(async (): Promise<bigint> => {
    if (!walletAddress) return 0n;
    const balance = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.usdc as Address,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [walletAddress],
    });
    return balance as bigint;
  }, [walletAddress]);

  //  READ: Get ETH balance (used for gas) ─

  const getEthBalance = useCallback(async (): Promise<string> => {
    if (!walletAddress) return "0";
    const balance = await publicClient.getBalance({ address: walletAddress as Address });
    return formatUnits(balance, 18);
  }, [walletAddress]);

  //  READ: Total show count from factory ─

  const getShowCount = useCallback(async (): Promise<number> => {
    const count = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.showFactory as Address,
      abi: SHOW_FACTORY_ABI,
      functionName: "showCount",
    });
    return Number(count);
  }, []);

  //  READ: Tix balance of a specific show's token ─

  const getTixBalance = useCallback(
    async (tixAddress: Address): Promise<bigint> => {
      if (!walletAddress) return 0n;
      const balance = await publicClient.readContract({
        address: tixAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [walletAddress],
      });
      return balance as bigint;
    },
    [walletAddress]
  );

  //  READ: Quote — how many tix out for a USDC amount ─

  const calculateTixOut = useCallback(
    async (
      bondingCurveAddress: Address,
      usdcAmount: bigint
    ): Promise<{ tixOut: bigint; fee: bigint }> => {
      const result = await publicClient.readContract({
        address: bondingCurveAddress,
        abi: BONDING_CURVE_ABI,
        functionName: "calculateTixOut",
        args: [usdcAmount],
      });
      const [tixOut, fee] = result as [bigint, bigint];
      return { tixOut, fee };
    },
    []
  );

  //  READ: Quote — how much USDC out for selling tix ─

  const calculateUsdcOut = useCallback(
    async (
      bondingCurveAddress: Address,
      tixAmount: bigint
    ): Promise<{ usdcOut: bigint; fee: bigint }> => {
      const result = await publicClient.readContract({
        address: bondingCurveAddress,
        abi: BONDING_CURVE_ABI,
        functionName: "calculateUsdcOut",
        args: [tixAmount],
      });
      const [usdcOut, fee] = result as [bigint, bigint];
      return { usdcOut, fee };
    },
    []
  );

  //  WRITE: Buy tix speculatively (no episode unlock) ─
  //
  // Flow:
  //   1. Approve USDC for bondingCurve
  //   2. bondingCurve.buyTix(usdcAmount, minTixOut)

  const buyTix = useCallback(
    async ({
      bondingCurveAddress,
      usdcAmount,
      minTixOut = 0n,
    }: {
      bondingCurveAddress: Address;
      usdcAmount: bigint;
      minTixOut?: bigint;
    }): Promise<Hash | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { walletClient, providerPublicClient } = await getWalletClient();

        if (!isApprovalCached(walletAddress, CONTRACT_ADDRESSES.usdc, bondingCurveAddress)) {
          const currentAllowance = await providerPublicClient.readContract({
            address: CONTRACT_ADDRESSES.usdc as Address,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [walletAddress, bondingCurveAddress],
          });
          if ((currentAllowance as bigint) < usdcAmount) {
            const approveTx = await walletClient.writeContract({
              address: CONTRACT_ADDRESSES.usdc as Address,
              abi: ERC20_ABI,
              functionName: "approve",
              args: [bondingCurveAddress, maxUint256],
              gas: 100_000n,
            });
            await waitForReceiptResilient(approveTx, [providerPublicClient, publicClient]);
          }
          cacheApproval(walletAddress, CONTRACT_ADDRESSES.usdc, bondingCurveAddress);
        }

        const tx = await walletClient.writeContract({
          address: bondingCurveAddress,
          abi: BONDING_CURVE_ABI,
          functionName: "buyTix",
          args: [usdcAmount, minTixOut],
          gas: 500_000n,
        });

        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Buy failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  //  WRITE: Sell tix back to bonding curve for USDC ─
  //
  // No approval needed — bondingCurve burns tix directly from msg.sender.

  const sellTix = useCallback(
    async ({
      bondingCurveAddress,
      tixAmount,
      minUsdcOut = 0n,
    }: {
      bondingCurveAddress: Address;
      tixAmount: bigint;
      minUsdcOut?: bigint;
    }): Promise<Hash | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { walletClient, providerPublicClient } = await getWalletClient();

        const tx = await walletClient.writeContract({
          address: bondingCurveAddress,
          abi: BONDING_CURVE_ABI,
          functionName: "sellTix",
          args: [tixAmount, minUsdcOut],
          gas: 500_000n,
        });

        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sell failed";
        setError(msg);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  // ── creatorBuyTix ────────────────────────────────────────────────────────
  const creatorBuyTix = useCallback(
    async ({
      bondingCurveAddress,
      usdcAmount,
      minTixOut = 0n,
    }: {
      bondingCurveAddress: Address;
      usdcAmount: bigint;
      minTixOut?: bigint;
    }): Promise<Hash | null> => {
      if (!walletAddress) { setError("No wallet connected"); return null; }
      setIsLoading(true);
      setError(null);
      try {
        const { walletClient, providerPublicClient } = await getWalletClient();

        if (!isApprovalCached(walletAddress, CONTRACT_ADDRESSES.usdc, bondingCurveAddress)) {
          const creatorBuyAllowance = await providerPublicClient.readContract({
            address: CONTRACT_ADDRESSES.usdc as Address,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [walletAddress, bondingCurveAddress],
          });
          if ((creatorBuyAllowance as bigint) < usdcAmount) {
            const approveTx = await walletClient.writeContract({
              address: CONTRACT_ADDRESSES.usdc as Address,
              abi: ERC20_ABI,
              functionName: "approve",
              args: [bondingCurveAddress, maxUint256],
              gas: 100_000n,
            });
            await waitForReceiptResilient(approveTx, [providerPublicClient, publicClient]);
          }
          cacheApproval(walletAddress, CONTRACT_ADDRESSES.usdc, bondingCurveAddress);
        }

        const tx = await walletClient.writeContract({
          address: bondingCurveAddress,
          abi: BONDING_CURVE_ABI,
          functionName: "creatorBuyTix",
          args: [usdcAmount, minTixOut],
          gas: 500_000n,
        });

        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Creator buy failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  // ── endCreatorPhase ──────────────────────────────────────────────────────
  const endCreatorPhase = useCallback(
    async (bondingCurveAddress: Address): Promise<Hash | null> => {
      if (!walletAddress) { setError("No wallet connected"); return null; }
      setIsLoading(true);
      setError(null);
      try {
        const { walletClient, providerPublicClient } = await getWalletClient();
        const tx = await walletClient.writeContract({
          address: bondingCurveAddress,
          abi: BONDING_CURVE_ABI,
          functionName: "endCreatorPhase",
          args: [],
          gas: 200_000n,
        });
        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        setError(err instanceof Error ? err.message : "End creator phase failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  // ── lockCreatorTokens ────────────────────────────────────────────────────
  // Creator approves their TIX then locks them into the bonding curve for a
  // chosen duration. Locked TIX earn the green lock badge on the Trade page.
  const lockCreatorTokens = useCallback(
    async ({
      bondingCurveAddress,
      tixTokenAddress,
      amount,
      lockDuration,
    }: {
      bondingCurveAddress: Address;
      tixTokenAddress: Address;
      amount: bigint;
      lockDuration: bigint; // seconds
    }): Promise<Hash | null> => {
      if (!walletAddress) { setError("No wallet connected"); return null; }
      setIsLoading(true);
      setError(null);
      try {
        const { walletClient, providerPublicClient } = await getWalletClient();
        if (!isApprovalCached(walletAddress, tixTokenAddress, bondingCurveAddress)) {
          const lockAllowance = await providerPublicClient.readContract({
            address: tixTokenAddress,
            abi: ERC20_ABI,
            functionName: "allowance",
            args: [walletAddress, bondingCurveAddress],
          });
          if ((lockAllowance as bigint) < amount) {
            const approveTx = await walletClient.writeContract({
              address: tixTokenAddress,
              abi: ERC20_ABI,
              functionName: "approve",
              args: [bondingCurveAddress, maxUint256],
              gas: 100_000n,
            });
            await waitForReceiptResilient(approveTx, [providerPublicClient, publicClient]);
          }
          cacheApproval(walletAddress, tixTokenAddress, bondingCurveAddress);
        }
        const tx = await walletClient.writeContract({
          address: bondingCurveAddress,
          abi: BONDING_CURVE_ABI,
          functionName: "lockCreatorTokens",
          args: [amount, lockDuration],
          gas: 300_000n,
        });
        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lock failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  // ── claimRoyalties ───────────────────────────────────────────────────────
  // Swaps the creator's pending TIX royalties back to USDC via the bonding curve.
  // minUsdcOut = 0n means accept any price (no slippage protection).
  const claimRoyalties = useCallback(
    async (showContractAddress: Address, minUsdcOut: bigint = 0n): Promise<Hash | null> => {
      if (!walletAddress) { setError("No wallet connected"); return null; }
      setIsLoading(true);
      setError(null);
      try {
        const { walletClient, providerPublicClient } = await getWalletClient();
        const tx = await walletClient.writeContract({
          address: showContractAddress,
          abi: [
            {
              name: "claimRoyalties",
              type: "function",
              stateMutability: "nonpayable",
              inputs: [{ name: "minUsdcOut", type: "uint256" }],
              outputs: [],
            },
          ] as const,
          functionName: "claimRoyalties",
          args: [minUsdcOut],
          gas: 500_000n,
        });
        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Claim royalties failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  // ── unlockCreatorTokens ───────────────────────────────────────────────────
  // Releases locked creator TIX back to the creator's wallet after the lock period expires.
  const unlockCreatorTokens = useCallback(
    async (bondingCurveAddress: Address): Promise<Hash | null> => {
      if (!walletAddress) { setError("No wallet connected"); return null; }
      setIsLoading(true);
      setError(null);
      try {
        const { walletClient, providerPublicClient } = await getWalletClient();
        const tx = await walletClient.writeContract({
          address: bondingCurveAddress,
          abi: BONDING_CURVE_ABI,
          functionName: "unlockCreatorTokens",
          args: [],
          gas: 200_000n,
        });
        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unlock failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  // ── claimCreatorFees ──────────────────────────────────────────────────────
  // Transfers the full creatorFeeBalance from ShowFeeDistributor to the creator's wallet as USDC.
  // No platform fee — the 1/1/1 split already happened when fees were received.
  const claimCreatorFees = useCallback(
    async (feeDistributorAddress: Address): Promise<Hash | null> => {
      if (!walletAddress) { setError("No wallet connected"); return null; }
      setIsLoading(true);
      setError(null);
      try {
        const { walletClient, providerPublicClient } = await getWalletClient();
        const tx = await walletClient.writeContract({
          address: feeDistributorAddress,
          abi: SHOW_FEE_DISTRIBUTOR_ABI,
          functionName: "claimCreatorFees",
          gas: 150_000n,
        });
        await waitForReceiptResilient(tx, [providerPublicClient, publicClient]);
        return tx;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Claim creator fees failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getWalletClient]
  );

  return {
    // State
    isLoading,
    error,
    walletAddress,
    // Reads
    checkAccess,
    quoteCostToWatch,
    getShowInfo,
    getCurveState,
    getUsdcBalance,
    getUsdcBalanceRaw,
    getEthBalance,
    getShowCount,
    getTixBalance,
    getTixAddress,
    calculateTixOut,
    calculateUsdcOut,
    // Writes
    buyAndUnlock,
    buyAndUnlockBatch,
    createShow,
    addEpisode,
    buyTix,
    sellTix,
    unlockWithTix,
    creatorBuyTix,
    endCreatorPhase,
    lockCreatorTokens,
    unlockCreatorTokens,
    claimRoyalties,
    claimCreatorFees,
  };
}
