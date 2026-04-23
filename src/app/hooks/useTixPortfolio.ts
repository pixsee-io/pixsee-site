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
  BONDING_CURVE_ABI,
  CONTRACT_ADDRESSES,
  ERC20_ABI,
  SHOW_FACTORY_ABI,
} from "../lib/pixsee-contracts";
import type { ShowInfo } from "./usePixseeContract";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(undefined, { batch: true }),
});

// Cast imported JSON ABIs to Abi so multicall accepts them without type errors
const FACTORY_ABI = SHOW_FACTORY_ABI as Abi;
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
  show: ShowInfo;
  spotPricePerToken: bigint;
  spotPricePerMinute: bigint;
  pricePerMinuteDisplay: string;
  totalVolumeUsdc: string;
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
      // ── Round-trip 1: showCount + USDC balance ────────────────────────────
      // Two individual reads — avoids the conditional-spread type complexity.
      const [showCountRaw, usdcRaw] = await Promise.all([
        publicClient.readContract({
          address: CONTRACT_ADDRESSES.showFactory as Address,
          abi: FACTORY_ABI,
          functionName: "showCount",
        }) as Promise<bigint>,
        walletAddress
          ? (publicClient.readContract({
              address: CONTRACT_ADDRESSES.usdc as Address,
              abi: ERC20,
              functionName: "balanceOf",
              args: [walletAddress],
            }) as Promise<bigint>)
          : Promise.resolve(0n),
      ]);

      setUsdcBalanceRaw(usdcRaw);

      const showCount = Number(showCountRaw);
      if (showCount === 0) {
        setHoldings([]);
        setAllShows([]);
        return;
      }

      const showIds = Array.from({ length: showCount }, (_, i) => i + 1);

      // ── Round-trip 2: all getShow(id) batched into one request ────────────
      const showResults = await publicClient.multicall({
        allowFailure: false,
        contracts: showIds.map((id) => ({
          address: CONTRACT_ADDRESSES.showFactory as Address,
          abi: FACTORY_ABI,
          functionName: "getShow",
          args: [BigInt(id)],
        })),
      });

      const showInfos = showResults as ShowInfo[];

      // ── Round-trip 3: getCurveState × N + balanceOf × N in one request ────
      // Layout per show: [curveState, ...optionally tixBalance]
      // stride = 2 when wallet connected, 1 otherwise
      const stride = walletAddress ? 2 : 1;

      const perShowContracts = showInfos.flatMap((show) => {
        const curveCall = {
          address: show.bondingCurve as Address,
          abi: CURVE_ABI,
          functionName: "getCurveState",
        };
        if (!walletAddress) return [curveCall];
        return [
          curveCall,
          {
            address: show.tix as Address,
            abi: ERC20,
            functionName: "balanceOf",
            args: [walletAddress],
          },
        ];
      });

      const perShowResults = await publicClient.multicall({
        allowFailure: true,
        contracts: perShowContracts,
      });

      const listings: ShowListing[] = [];
      const userHoldings: TixHolding[] = [];

      showInfos.forEach((show, i) => {
        const curveEntry = perShowResults[i * stride];
        const curveState =
          curveEntry.status === "success"
            ? (curveEntry.result as bigint[])
            : null;

        const tixBalanceEntry =
          walletAddress ? perShowResults[i * stride + 1] : undefined;
        const tixBalance: bigint =
          tixBalanceEntry?.status === "success"
            ? (tixBalanceEntry.result as bigint)
            : 0n;

        const spotPricePerToken = curveState?.[0] ?? 0n;
        const spotPricePerMinute = curveState?.[1] ?? 0n;
        const totalVolumeUsdc = curveState?.[3] ?? 0n;

        listings.push({
          showId: showIds[i],
          show,
          spotPricePerToken,
          spotPricePerMinute,
          pricePerMinuteDisplay: formatUnits(spotPricePerMinute, 6),
          totalVolumeUsdc: formatUnits(totalVolumeUsdc, 6),
        });

        if (tixBalance > 0n) {
          const valueUsdc = (tixBalance * spotPricePerToken) / BigInt(1e18);
          userHoldings.push({
            showId: showIds[i],
            show,
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
