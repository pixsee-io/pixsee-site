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
import { useWallets } from "@privy-io/react-auth";
import {
  toEventHash,
  decodeEventLog,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatUnits,
  type Address,
  type Hash,
} from "viem";

import { baseSepolia } from "viem/chains";
import {
  BONDING_CURVE_ABI,
  CONTRACT_ADDRESSES,
  ERC20_ABI,
  ROUTER_ABI,
  SHOW_CONTRACT_ABI,
  SHOW_FACTORY_ABI,
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
  transport: http(),
});

//  Hook ─

export function usePixseeContract() {
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gets the user's Privy embedded wallet (or connected external wallet)
  const getWalletClient = useCallback(async () => {
    const wallet = wallets[0];
    if (!wallet) throw new Error("No wallet connected");

    await wallet.switchChain(baseSepolia.id);
    const provider = await wallet.getEthereumProvider();

    return createWalletClient({
      chain: baseSepolia,
      transport: custom(provider),
      account: wallet.address as Address,
    });
  }, [wallets]);

  const walletAddress = wallets[0]?.address as Address | undefined;

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

  //  READ: Get USDC cost to watch N minutes ─

  const quoteCostToWatch = useCallback(
    async (
      bondingCurveAddress: Address,
      durationMinutes: number
    ): Promise<{ usdcCost: bigint; fee: bigint; displayCost: string }> => {
      const [usdcCost, fee] = (await publicClient.readContract({
        address: bondingCurveAddress,
        abi: BONDING_CURVE_ABI,
        functionName: "quoteCostToWatch",
        args: [BigInt(Math.ceil(durationMinutes))],
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
      currentHalfSupply,
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
      durationMinutes,
    }: {
      showContractAddress: Address;
      bondingCurveAddress: Address;
      episodeId: number;
      durationMinutes: number;
    }): Promise<Hash | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const walletClient = await getWalletClient();

        const { usdcCost } = await quoteCostToWatch(
          bondingCurveAddress,
          durationMinutes
        );
        const usdcWithSlippage = (usdcCost * BigInt(102)) / BigInt(100);

        const currentAllowance = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.usdc as Address,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [walletAddress, CONTRACT_ADDRESSES.router as Address],
        });

        if (currentAllowance < usdcWithSlippage) {
          const approveTx = await walletClient.writeContract({
            address: CONTRACT_ADDRESSES.usdc as Address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESSES.router as Address, usdcWithSlippage],
            gas: 100_000n,
          });
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
        }

        const unlockTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.router as Address,
          abi: ROUTER_ABI,
          functionName: "buyAndUnlock",
          args: [showContractAddress, BigInt(episodeId), usdcWithSlippage, 0n],
          gas: 1_000_000n,
        });

        await publicClient.waitForTransactionReceipt({ hash: unlockTx });
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
      totalDurationMinutes,
    }: {
      showContractAddress: Address;
      bondingCurveAddress: Address;
      episodeIds: number[];
      totalDurationMinutes: number;
    }): Promise<Hash | null> => {
      if (!walletAddress) {
        setError("No wallet connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const walletClient = await getWalletClient();

        const { usdcCost } = await quoteCostToWatch(
          bondingCurveAddress,
          totalDurationMinutes
        );
        const usdcWithSlippage = (usdcCost * BigInt(102)) / BigInt(100);

        const currentAllowance = await publicClient.readContract({
          address: CONTRACT_ADDRESSES.usdc as Address,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [walletAddress, CONTRACT_ADDRESSES.router as Address],
        });

        if (currentAllowance < usdcWithSlippage) {
          const approveTx = await walletClient.writeContract({
            address: CONTRACT_ADDRESSES.usdc as Address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESSES.router as Address, usdcWithSlippage],
            gas: 100_000n,
          });
          await publicClient.waitForTransactionReceipt({ hash: approveTx });
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

        await publicClient.waitForTransactionReceipt({ hash: unlockTx });
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
        const walletClient = await getWalletClient();

        const tx = await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.showFactory as Address,
          abi: SHOW_FACTORY_ABI,
          functionName: "createShow",
          args: [title, tickName, tickSymbol, creatorAddress, curveTier],
        });

        console.log("createShow tx hash:", tx);

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: tx,
        });
        console.log("createShow receipt status:", receipt.status);

        if (receipt.status === "reverted") {
          setError("Show creation transaction reverted");
          return null;
        }

        // Topic0 of ShowCreated event — confirmed from Basescan Events tab

        const SHOW_CREATED_TOPIC = toEventHash(
          "ShowCreated(uint256,address,string,string,string,uint8,address,address,address,address)"
        );
        console.log("SHOW_CREATED_TOPIC:", SHOW_CREATED_TOPIC);
        // const SHOW_CREATED_TOPIC =
        //   "0x239c2a9ff49414ff2b36f7c4a3a4021cb0c771bad39386af077912816ca9a20f";

        const showCreatedLog = receipt.logs.find(
          (log) =>
            log.address.toLowerCase() ===
              CONTRACT_ADDRESSES.showFactory.toLowerCase() &&
            log.topics[0]?.toLowerCase() === SHOW_CREATED_TOPIC
        );

        console.log("ShowCreated log:", showCreatedLog);

        if (!showCreatedLog || !showCreatedLog.topics[1]) {
          console.error("ShowCreated event not found in logs");
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
        console.log("showId from event:", showId.toString());

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
        const walletClient = await getWalletClient();

        const tx = await walletClient.writeContract({
          address: showContractAddress,
          abi: SHOW_CONTRACT_ABI,
          functionName: "addEpisode",
          args: [BigInt(durationSeconds), isFree],
          gas: 300_000n,
        });

        console.log("addEpisode tx hash:", tx);

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: tx,
        });

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
    // Writes
    buyAndUnlock,
    buyAndUnlockBatch,
    createShow,
    addEpisode,
  };
}
