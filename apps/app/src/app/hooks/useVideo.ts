"use client";

import { useState, useEffect, useCallback } from "react";
import type { ShowCardProps, FeaturedShowData } from "@/app/utils";
import { ApiVideo, ApiVideosResponse } from "../types/pixsee-api";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

type GetAccessToken = () => Promise<string | null>;

//  Helpers (exported for use in other components)

export function formatCount(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function getCreator(video: ApiVideo) {
  const c = video.creator ?? video.user ?? null;
  return {
    name: c?.name ?? c?.username ?? "Unknown",
    avatar: c?.avatar_url ?? undefined,
  };
}

//  Mappers

function mapVideoToShowCard(video: ApiVideo): ShowCardProps {
  const creator = video.creator ?? video.user;
  // Prefer explicit video_format from backend; fall back to type-based heuristic for old records
  const isLandscape = video.video_format != null
    ? video.video_format === "landscape"
    : video.type === "tv_show"; // tv_show series are typically landscape; single "movie" isn't always
  return {
    id: String(video.id),
    title: video.title,
    thumbnailUrl:
      video.cover_image_url ??
      video.thumbnail_url ??
      video.cover_url ??
      "/images/movie1.png",
    creatorName: creator?.name ?? creator?.username ?? "Unknown",
    creatorAvatar: creator?.avatar_url,
    views: formatCount(video.view_count),
    likes: formatCount(video.likes_count),
    description: video.description,
    isLiked: video.is_liked,
    videoFormat: isLandscape ? "landscape" : "portrait",
  };
}

function mapVideoToFeatured(video: ApiVideo): FeaturedShowData {
  const creator = video.creator ?? video.user;
  return {
    id: String(video.id),
    title: video.title,
    description: video.description ?? "",
    thumbnailUrl:
      video.thumbnail_url ?? video.cover_url ?? "/images/featured-movie1.png",
    creatorName: creator?.name ?? creator?.username ?? "Unknown",
    creatorAvatar: creator?.avatar_url,
    views: formatCount(video.view_count),
    likes: formatCount(video.likes_count),
  };
}

//  useVideos (list)

type UseVideosOptions = {
  page?: number;
  perPage?: number;
  sort?: string;
  filterIsFree?: boolean;
  filterCategoryId?: number;
  filterTitle?: string;
};

type UseVideosReturn = {
  shows: ShowCardProps[];
  featuredShows: FeaturedShowData[];
  isLoading: boolean;
  error: string | null;
  meta: ApiVideosResponse["meta"] | null;
  refetch: () => void;
};

export function useVideos({
  page = 1,
  perPage = 20,
  sort = "-published_at",
  filterIsFree,
  filterCategoryId,
  filterTitle,
  getAccessToken,
}: UseVideosOptions & { getAccessToken?: GetAccessToken } = {}): UseVideosReturn {
  const [data, setData] = useState<ApiVideo[]>([]);
  const [meta, setMeta] = useState<ApiVideosResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchVideos() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(perPage),
          sort,
        });

        if (filterIsFree !== undefined)
          params.set("filter[is_free]", String(filterIsFree));
        if (filterCategoryId !== undefined)
          params.set("filter[category_id]", String(filterCategoryId));
        if (filterTitle) params.set("filter[title]", filterTitle);

        // Send auth token on public routes so is_liked resolves correctly
        const token = getAccessToken ? await getAccessToken() : null;
        const res = await fetch(
          `${BASE_URL}/api/v1/shows?${params.toString()}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (!res.ok)
          throw new Error(`API error: ${res.status} ${res.statusText}`);

        const json: ApiVideosResponse = await res.json();
        if (!cancelled) {
          // Only show videos whose parent show is registered on-chain
          const filtered = (json.data ?? []).filter(
            (item: any) => item.bonding_curve != null
          );
          setData(filtered);
          setMeta(json.meta ?? null);
        }
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to fetch videos"
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchVideos();
    return () => {
      cancelled = true;
    };
  }, [page, perPage, sort, filterIsFree, filterCategoryId, filterTitle, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    shows: data.map(mapVideoToShowCard),
    featuredShows: data.slice(0, 5).map(mapVideoToFeatured),
    isLoading,
    error,
    meta,
    refetch,
  };
}

//  useVideo (single) ─

type UseVideoReturn = {
  video: ApiVideo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useVideo(
  id: string | number,
  getAccessToken?: GetAccessToken
): UseVideoReturn {
  const [video, setVideo] = useState<ApiVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchShow() {
      setIsLoading(true);
      setError(null);
      try {
        // Use authenticated my-shows endpoint to get full episode data
        const token = getAccessToken ? await getAccessToken() : null;
        const res = await fetch(`${BASE_URL}/api/v1/my-shows/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setVideo(json?.data ?? json);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to fetch show");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchShow();
    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  return { video, isLoading, error, refetch };
}

// useMyShows — authenticated list of the current user's own shows

export function useMyShows(getAccessToken: GetAccessToken) {
  const [shows, setShows] = useState<ShowCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch(`${BASE_URL}/api/v1/my-shows?per_page=50`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setShows((json.data ?? []).map(mapVideoToShowCard));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetch_();
    return () => { cancelled = true; };
  }, [getAccessToken]);

  return { shows, isLoading };
}

//  useEpisodePlayback
// Fetches playback URL for a specific episode by its video.id
// Also fires track-view on load

type UseEpisodePlaybackReturn = {
  playbackUrl: string | null;
  isLoading: boolean;
  error: string | null;
};

export function useEpisodePlayback(
  videoId: number | null,
  getAccessToken: GetAccessToken,
  refreshKey?: number
): UseEpisodePlaybackReturn {
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;

    async function fetchPlayback() {
      setIsLoading(true);
      setError(null);
      setPlaybackUrl(null);

      try {
        const token = await getAccessToken();
        const headers: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        // 1. Get signed playback URL for this episode's video
        const res = await fetch(
          `${BASE_URL}/api/v1/videos/${videoId}/playback`,
          { headers }
        );
        if (!res.ok) throw new Error(`Playback fetch failed: ${res.status}`);
        const json = await res.json();
        const url: string = json?.playback_url ?? "";
        if (!cancelled) setPlaybackUrl(url);

        // 2. Track the view (fire and forget)
        fetch(`${BASE_URL}/api/v1/videos/${videoId}/track-view`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
        }).catch(() => {});
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load playback"
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPlayback();
    return () => {
      cancelled = true;
    };
  }, [videoId, refreshKey]);

  return { playbackUrl, isLoading, error };
}

//  trackProgress
// Call this periodically while an episode is playing

export async function trackProgress(
  videoId: number,
  watchedSeconds: number,
  currentPosition: number,
  getAccessToken: GetAccessToken
): Promise<void> {
  try {
    const token = await getAccessToken();
    await fetch(`${BASE_URL}/api/v1/videos/${videoId}/update-progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        watched_seconds: watchedSeconds,
        current_position: currentPosition,
      }),
    });
  } catch {
    // Non-critical — swallow silently
  }
}
