"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createPublicClient,
  http,
  formatUnits,
  type Address,
  type Abi,
} from "viem";
import { baseSepolia } from "viem/chains";
import {
  BASE_SEPOLIA_RPC,
  BONDING_CURVE_ABI,
  CONTRACT_ADDRESSES,
  ERC20_ABI,
} from "../lib/pixsee-contracts";
import { queryKeys } from "../lib/queryKeys";
import type { ShowInfo } from "./usePixseeContract";

const BACKEND_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(BASE_SEPOLIA_RPC, { batch: true }),
});

const CURVE_ABI = BONDING_CURVE_ABI as Abi;
const ERC20 = ERC20_ABI as Abi;

export type TixHolding = {
  showId: number;
  show: ShowInfo;
  tixBalance: bigint;
  tixBalanceDisplay: string;
  spotPricePerToken: bigint;
  valueUsdc: bigint;
  valueUsdcDisplay: string;
  lockedTix?: bigint;
  lockExpiry?: bigint;
};

export type ShowListing = {
  showId: number;
  backendShowId?: number;
  show: ShowInfo;
  spotPricePerToken: bigint;
  spotPricePerMinute: bigint;
  pricePerMinuteDisplay: string;
  totalVolumeUsdc: string;
  tixSupply: bigint;
  creatorTokensLocked?: boolean;
};

export type TixPortfolio = {
  usdcBalance: string;
  usdcBalanceRaw: bigint;
  holdings: TixHolding[];
  allShows: ShowListing[];
  totalPortfolioValueDisplay: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

type BackendShow = {
  id: number;
  title: string;
  bonding_curve: string;
  tix_token: string;
  show_contract: string;
  fee_distributor: string | null;
  tick_symbol: string | null;
  creator?: { wallet_address?: string };
};

// ─── Core async fetch (extracted for testability and clarity) ─────────────────

async function fetchPortfolioData(walletAddress: Address | undefined) {
  const res = await fetch(`${BACKEND_URL}/api/v1/shows?per_page=200&sort=-created_at`);
  if (!res.ok) throw new Error("Failed to fetch shows list");
  const json = await res.json();

  const backendShows: BackendShow[] = (json.data ?? []).filter(
    (s: BackendShow) => s.bonding_curve && s.tix_token && s.show_contract
  );

  // USDC balance
  const usdcRaw = walletAddress
    ? ((await publicClient.readContract({
        address: CONTRACT_ADDRESSES.usdc as Address,
        abi: ERC20,
        functionName: "balanceOf",
        args: [walletAddress],
      })) as bigint)
    : 0n;

  if (backendShows.length === 0) {
    return { usdcRaw, listings: [], userHoldings: [] };
  }

  // Batch multicall per show
  // Stride 3 (no wallet): getCurveState, isCreatorLocked, getCreatorLockInfo
  // Stride 4 (with wallet): + balanceOf
  const stride = walletAddress ? 4 : 3;
  const perShowContracts = backendShows.flatMap((s) => {
    const base = [
      { address: s.bonding_curve as Address, abi: CURVE_ABI, functionName: "getCurveState" },
      { address: s.bonding_curve as Address, abi: CURVE_ABI, functionName: "isCreatorLocked" },
      { address: s.bonding_curve as Address, abi: CURVE_ABI, functionName: "getCreatorLockInfo" },
    ];
    if (!walletAddress) return base;
    return [...base, { address: s.tix_token as Address, abi: ERC20, functionName: "balanceOf", args: [walletAddress] }];
  });

  const results = await publicClient.multicall({ allowFailure: true, contracts: perShowContracts });

  const listings: ShowListing[] = [];
  const userHoldings: TixHolding[] = [];

  backendShows.forEach((s, i) => {
    const curveEntry = results[i * stride];
    const curveState = curveEntry.status === "success" ? (curveEntry.result as bigint[]) : null;

    const lockedEntry = results[i * stride + 1];
    const creatorTokensLocked: boolean | undefined =
      lockedEntry?.status === "success" ? (lockedEntry.result as boolean) : undefined;

    const lockInfoEntry = results[i * stride + 2];
    const lockInfo = lockInfoEntry?.status === "success"
      ? (lockInfoEntry.result as readonly [bigint, bigint])
      : null;

    const tixBalEntry = walletAddress ? results[i * stride + 3] : undefined;
    const tixBalance: bigint =
      tixBalEntry?.status === "success" ? (tixBalEntry.result as bigint) : 0n;

    // getCreatorLockInfo returns the show creator's lock — only attribute to current user
    // if their wallet IS the creator's wallet.
    const isCreator =
      walletAddress &&
      s.creator?.wallet_address &&
      walletAddress.toLowerCase() === s.creator.wallet_address.toLowerCase();
    const lockedTix = isCreator ? (lockInfo?.[0] ?? 0n) : 0n;
    const lockExpiry = isCreator ? (lockInfo?.[1] ?? 0n) : 0n;

    const spotPricePerToken = curveState?.[0] ?? 0n;
    const spotPricePerMinute = curveState?.[1] ?? 0n;
    const totalVolumeUsdc = curveState?.[3] ?? 0n;
    const tixSupply = curveState?.[4] ?? 0n;

    const tickSymbol = s.tick_symbol ?? s.title.toUpperCase().replace(/\s+/g, "").slice(0, 10);

    const showInfo: ShowInfo = {
      creator: (s.creator?.wallet_address ?? "0x0000000000000000000000000000000000000000") as Address,
      tix: s.tix_token as Address,
      feeDistributor: (s.fee_distributor ?? "0x0000000000000000000000000000000000000000") as Address,
      bondingCurve: s.bonding_curve as Address,
      showContract: s.show_contract as Address,
      title: s.title,
      tickName: tickSymbol,
      tickSymbol,
      curveTier: 0,
      createdAt: 0n,
    };

    listings.push({
      showId: s.id,
      backendShowId: s.id,
      show: showInfo,
      spotPricePerToken,
      spotPricePerMinute,
      pricePerMinuteDisplay: formatUnits(spotPricePerMinute, 6),
      totalVolumeUsdc: formatUnits(totalVolumeUsdc, 6),
      tixSupply,
      creatorTokensLocked,
    });

    // Include in holdings if wallet balance OR locked tokens exist
    if (tixBalance > 0n || lockedTix > 0n) {
      const totalTix = tixBalance + lockedTix;
      const valueUsdc = (totalTix * spotPricePerToken) / BigInt(1e18);
      userHoldings.push({
        showId: s.id,
        show: showInfo,
        tixBalance,
        tixBalanceDisplay: formatUnits(tixBalance, 18),
        spotPricePerToken,
        valueUsdc,
        valueUsdcDisplay: formatUnits(valueUsdc, 6),
        lockedTix: lockedTix > 0n ? lockedTix : undefined,
        lockExpiry: lockExpiry > 0n ? lockExpiry : undefined,
      });
    }
  });

  return { usdcRaw, listings, userHoldings };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTixPortfolio(walletAddress: Address | undefined): TixPortfolio {
  const query = useQuery({
    queryKey: queryKeys.portfolio.tix(walletAddress),
    queryFn: () => fetchPortfolioData(walletAddress),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Live price updates every 30s
    // BigInt values live fine in memory — React Query's in-memory cache handles them.
    // Do NOT add `gcTime: 0` or JSON serialization concerns: we never persist this cache.
  });

  const { usdcRaw = 0n, listings = [], userHoldings = [] } = query.data ?? {};

  const totalTixValue = userHoldings.reduce((sum, h) => sum + h.valueUsdc, 0n);
  const totalPortfolioRaw = usdcRaw + totalTixValue;

  return {
    usdcBalance: formatUnits(usdcRaw, 6),
    usdcBalanceRaw: usdcRaw,
    holdings: userHoldings,
    allShows: listings,
    totalPortfolioValueDisplay: formatUnits(totalPortfolioRaw, 6),
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refresh: query.refetch,
  };
}
