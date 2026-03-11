"use client";

import { useState, useEffect, useCallback } from "react";
import type { ShowCardProps, FeaturedShowData } from "@/app/utils";
import { ApiVideo, ApiVideosResponse } from "../types/pixsee-api";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";


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


function mapVideoToShowCard(video: ApiVideo): ShowCardProps {
  const creator = video.creator ?? video.user;
  return {
    id: String(video.id),
    title: video.title,
    thumbnailUrl:
      video.thumbnail_url ?? video.cover_url ?? "/images/movie1.png",
    creatorName: creator?.name ?? creator?.username ?? "Unknown",
    creatorAvatar: creator?.avatar_url ?? creator?.profile_image_url,
    views: formatCount(video.view_count), 
    likes: formatCount(video.likes_count),
    description: video.description,
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
    creatorAvatar: creator?.avatar_url ?? creator?.profile_image_url,
    views: formatCount(video.view_count), 
    likes: formatCount(video.likes_count),
  };
}

// ─── useVideos (list) ──────────────────────────────────────────────────────

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
}: UseVideosOptions = {}): UseVideosReturn {
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

        const res = await fetch(
          `${BASE_URL}/api/v1/videos?${params.toString()}`
        );
        if (!res.ok)
          throw new Error(`API error: ${res.status} ${res.statusText}`);

        const json: ApiVideosResponse = await res.json();
        if (!cancelled) {
          setData(json.data ?? []);
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
  }, [page, perPage, sort, filterIsFree, filterCategoryId, filterTitle, tick]);

  return {
    shows: data.map(mapVideoToShowCard),
    featuredShows: data.slice(0, 5).map(mapVideoToFeatured),
    isLoading,
    error,
    meta,
    refetch,
  };
}

// ─── useVideo (single) ─────────────────────────────────────────────────────

type UseVideoReturn = {
  video: ApiVideo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useVideo(id: string | number): UseVideoReturn {
  const [video, setVideo] = useState<ApiVideo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchVideo() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/api/v1/videos/${id}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        // Response may be { data: {...} } or the object directly
        const videoData: ApiVideo = json?.data ?? json;
        if (!cancelled) setVideo(videoData);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to fetch video"
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchVideo();
    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  return { video, isLoading, error, refetch };
}
