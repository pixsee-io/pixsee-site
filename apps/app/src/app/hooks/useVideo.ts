"use client";

import { useQuery } from "@tanstack/react-query";
import type { ShowCardProps, FeaturedShowData } from "@/app/utils";
import type { ApiVideo, ApiVideosResponse } from "../types/pixsee-api";
import { apiFetch } from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";
type GetAccessToken = () => Promise<string | null>;

// ─── Helpers (exported for use in other components) ───────────────────────────

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

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapVideoToShowCard(video: ApiVideo): ShowCardProps {
  const creator = video.creator ?? video.user;
  const isLandscape =
    video.video_format != null
      ? video.video_format === "landscape"
      : video.type === "tv_show";
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
    views: formatCount(video.views_count ?? video.view_count),
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
      video.cover_image_url ??
      video.thumbnail_url ??
      video.cover_url ??
      "/images/featured-movie1.png",
    creatorName: creator?.name ?? creator?.username ?? "Unknown",
    creatorAvatar: creator?.avatar_url,
    views: formatCount(video.views_count ?? video.view_count),
    likes: formatCount(video.likes_count),
  };
}

// ─── useVideos (list) ─────────────────────────────────────────────────────────

type UseVideosOptions = {
  page?: number;
  perPage?: number;
  sort?: string;
  filterIsFree?: boolean;
  filterCategoryId?: number;
  filterTitle?: string;
  getAccessToken?: GetAccessToken;
};

export function useVideos({
  page = 1,
  perPage = 20,
  sort = "-published_at",
  filterIsFree,
  filterCategoryId,
  filterTitle,
  getAccessToken,
}: UseVideosOptions = {}) {
  const params: Record<string, unknown> = { page, perPage, sort, filterIsFree, filterCategoryId, filterTitle };

  const query = useQuery({
    queryKey: queryKeys.shows.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams({ page: String(page), per_page: String(perPage), sort });
      if (filterIsFree !== undefined) qs.set("filter[is_free]", String(filterIsFree));
      if (filterCategoryId !== undefined) qs.set("filter[category_id]", String(filterCategoryId));
      if (filterTitle) qs.set("filter[title]", filterTitle);

      const token = getAccessToken ? await getAccessToken() : null;
      const json = await apiFetch<ApiVideosResponse>(`/api/v1/shows?${qs}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // Only show videos whose parent show is registered on-chain
      const filtered = (json.data ?? []).filter((item: any) => item.bonding_curve != null);
      return { data: filtered, meta: json.meta ?? null };
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    shows: (query.data?.data ?? []).map(mapVideoToShowCard),
    featuredShows: (query.data?.data ?? []).slice(0, 5).map(mapVideoToFeatured),
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    meta: query.data?.meta ?? null,
    refetch: query.refetch,
  };
}

// ─── useVideo (single) ────────────────────────────────────────────────────────

export function useVideo(id: string | number, getAccessToken?: GetAccessToken) {
  const query = useQuery({
    queryKey: queryKeys.shows.detail(id),
    queryFn: async () => {
      const token = getAccessToken ? await getAccessToken() : null;
      const json = await apiFetch<{ data?: ApiVideo } | ApiVideo>(
        `/api/v1/my-shows/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return (json as any)?.data ?? json;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });

  return {
    video: (query.data ?? null) as ApiVideo | null,
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

// ─── useMyShows — authenticated list of current user's shows ─────────────────

export function useMyShows(getAccessToken: GetAccessToken) {
  const query = useQuery({
    queryKey: queryKeys.shows.mine(),
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return [];
      const json = await apiFetch<{ data?: ApiVideo[] }>("/api/v1/my-shows?per_page=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return (json.data ?? []).map(mapVideoToShowCard);
    },
    staleTime: 30 * 1000,
  });

  return {
    shows: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// ─── useEpisodePlayback ───────────────────────────────────────────────────────

export function useEpisodePlayback(
  videoId: number | null,
  getAccessToken: GetAccessToken,
  refreshKey?: number
) {
  const query = useQuery({
    queryKey: queryKeys.playback.episode(videoId, refreshKey),
    queryFn: async () => {
      const token = await getAccessToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const json = await apiFetch<{ playback_url?: string }>(`/api/v1/videos/${videoId}/playback`, { headers });
      const url = json?.playback_url ?? "";

      // Track view — fire and forget
      fetch(`${BASE_URL}/api/v1/videos/${videoId}/track-view`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
      }).catch(() => {});

      return url;
    },
    enabled: videoId != null,
    staleTime: 5 * 60 * 1000, // playback URLs are valid for longer
    retry: 1,
  });

  return {
    playbackUrl: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
  };
}

// ─── trackProgress (fire-and-forget, no hook needed) ─────────────────────────

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
      body: JSON.stringify({ watched_seconds: watchedSeconds, current_position: currentPosition }),
    });
  } catch {
    // Non-critical — swallow silently
  }
}
