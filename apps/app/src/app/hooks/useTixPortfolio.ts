"use client";

import { useState, useEffect, useCallback } from "react";
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

export function useTixPortfolio(walletAddress: Address | undefined): TixPortfolio {
  const [usdcBalanceRaw, setUsdcBalanceRaw] = useState<bigint>(0n);
  const [holdings, setHoldings] = useState<TixHolding[]>([]);
  const [allShows, setAllShows] = useState<ShowListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ── Fetch on-chain shows from backend API ────────────────────────────
      // This covers all factory deployments, not just the current one.
      const res = await fetch(`${BACKEND_URL}/api/v1/shows?per_page=200&sort=-created_at`);
      if (!res.ok) throw new Error("Failed to fetch shows list");
      const json = await res.json();

      const backendShows: BackendShow[] = (json.data ?? []).filter(
        (s: BackendShow) => s.bonding_curve && s.tix_token && s.show_contract
      );

      // ── USDC balance ──────────────────────────────────────────────────────
      const usdcRaw = walletAddress
        ? ((await publicClient.readContract({
            address: CONTRACT_ADDRESSES.usdc as Address,
            abi: ERC20,
            functionName: "balanceOf",
            args: [walletAddress],
          })) as bigint)
        : 0n;
      setUsdcBalanceRaw(usdcRaw);

      if (backendShows.length === 0) {
        setHoldings([]);
        setAllShows([]);
        return;
      }

      // ── Batch: getCurveState × N + balanceOf × N ──────────────────────────
      const stride = walletAddress ? 2 : 1;
      const perShowContracts = backendShows.flatMap((s) => {
        const curveCall = {
          address: s.bonding_curve as Address,
          abi: CURVE_ABI,
          functionName: "getCurveState",
        };
        if (!walletAddress) return [curveCall];
        return [
          curveCall,
          {
            address: s.tix_token as Address,
            abi: ERC20,
            functionName: "balanceOf",
            args: [walletAddress],
          },
        ];
      });

      const results = await publicClient.multicall({
        allowFailure: true,
        contracts: perShowContracts,
      });

      const listings: ShowListing[] = [];
      const userHoldings: TixHolding[] = [];

      backendShows.forEach((s, i) => {
        const curveEntry = results[i * stride];
        const curveState =
          curveEntry.status === "success"
            ? (curveEntry.result as bigint[])
            : null;

        const tixBalEntry = walletAddress ? results[i * stride + 1] : undefined;
        const tixBalance: bigint =
          tixBalEntry?.status === "success"
            ? (tixBalEntry.result as bigint)
            : 0n;

        const spotPricePerToken = curveState?.[0] ?? 0n;
        const spotPricePerMinute = curveState?.[1] ?? 0n;
        const totalVolumeUsdc = curveState?.[3] ?? 0n;
        const tixSupply = curveState?.[4] ?? 0n;

        // Derive tickSymbol — backend may have null for older shows
        const tickSymbol =
          s.tick_symbol ??
          s.title.toUpperCase().replace(/\s+/g, "").slice(0, 10);

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
        });

        if (tixBalance > 0n) {
          const valueUsdc = (tixBalance * spotPricePerToken) / BigInt(1e18);
          userHoldings.push({
            showId: s.id,
            show: showInfo,
            tixBalance,
            tixBalanceDisplay: formatUnits(tixBalance, 18),
            spotPricePerToken,
            valueUsdc,
            valueUsdcDisplay: formatUnits(valueUsdc, 6),
          });
        }
      });

      setAllShows(listings);
      setHoldings(userHoldings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load portfolio");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const totalTixValue = holdings.reduce((sum, h) => sum + h.valueUsdc, 0n);
  const totalPortfolioRaw = usdcBalanceRaw + totalTixValue;

  return {
    usdcBalance: formatUnits(usdcBalanceRaw, 6),
    usdcBalanceRaw,
    holdings,
    allShows,
    totalPortfolioValueDisplay: formatUnits(totalPortfolioRaw, 6),
    isLoading,
    error,
    refresh: fetchPortfolio,
  };
}
