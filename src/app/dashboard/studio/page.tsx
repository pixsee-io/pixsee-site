"use client";

import { useEffect, useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { Plus, Film, Eye, Play, Pencil } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

type StudioShow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  video_format?: "landscape" | "portrait" | null;
  cover_image_url: string | null;
  status: "draft" | "published";
  on_chain_show_id: string | null;
  episode_count?: number;
  view_count?: number;
  episodes?: { id: number; view_count: number; is_free: boolean }[];
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ShowCard({ show }: { show: StudioShow }) {
  const episodeCount = show.episodes?.length ?? show.episode_count ?? 0;
  const totalViews =
    show.episodes?.reduce((sum, ep) => sum + ep.view_count, 0) ??
    show.view_count ??
    0;
  const isOnChain = !!show.on_chain_show_id;
  const isPortrait = show.video_format === "portrait";

  return (
    <Link
      href={`/dashboard/studio/${show.id}`}
      className="group relative bg-neutral-primary rounded-2xl overflow-hidden border border-neutral-tertiary-border hover:border-brand-pixsee-secondary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className={`relative ${isPortrait ? "aspect-3/4" : "aspect-video"} bg-neutral-secondary overflow-hidden`}>
        {show.cover_image_url ? (
          <Image
            src={show.cover_image_url}
            alt={show.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Film className="w-10 h-10 text-neutral-tertiary-text" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full ${
              show.status === "published"
                ? "bg-semantic-success-primary/90 text-white"
                : "bg-neutral-tertiary-text/90 text-white"
            }`}
          >
            {show.status === "published" ? "Live" : "Draft"}
          </span>
        </div>

        {/* On-chain badge */}
        {isOnChain && (
          <div className="absolute top-3 right-3">
            <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-brand-pixsee-secondary/90 text-white">
              On-chain
            </span>
          </div>
        )}

        {/* Episode count overlay */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[11px] sm:text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          <Play className="w-3 h-3" />
          {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-neutral-primary-text truncate mb-1 group-hover:text-brand-pixsee-secondary transition-colors">
          {show.title}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-tertiary-text line-clamp-2 mb-3 min-h-[2.5rem]">
          {show.description || "No description"}
        </p>

        <div className="flex items-center justify-between text-[11px] sm:text-xs text-neutral-tertiary-text gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1 shrink-0">
              <Eye className="w-3.5 h-3.5" />
              {totalViews.toLocaleString()}
            </span>
            <span className="capitalize truncate">
              {show.type.replace("_", " ")}
            </span>
          </div>
          <span className="shrink-0 hidden sm:inline">
            {formatDate(show.created_at)}
          </span>
        </div>
      </div>

      {/* Edit hint */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isOnChain && (
          <div className="bg-neutral-primary rounded-full p-1.5 shadow-md">
            <Pencil className="w-3.5 h-3.5 text-neutral-secondary-text" />
          </div>
        )}
      </div>
    </Link>
  );
}

export default function StudioPage() {
  const { getAccessToken } = usePrivy();
  const [shows, setShows] = useState<StudioShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShows = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/v1/my-shows?per_page=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to fetch shows (${res.status})`);
      const json = await res.json();
      const data: StudioShow[] = json?.data ?? json?.shows ?? json ?? [];
      setShows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shows");
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  return (
    <div className="min-h-screen bg-foundation-alternate">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-primary-text">
              Studio
            </h1>
            <p className="text-xs sm:text-sm text-neutral-tertiary-text mt-1">
              Manage your shows and episodes
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="flex items-center gap-1.5 sm:gap-2 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">New Show</span>
            <span className="xs:hidden sm:hidden">New</span>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-primary rounded-2xl overflow-hidden border border-neutral-tertiary-border animate-pulse"
              >
                <div className="aspect-video bg-neutral-tertiary" />
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-neutral-tertiary rounded w-3/4" />
                  <div className="h-3 bg-neutral-tertiary rounded w-full" />
                  <div className="h-3 bg-neutral-tertiary rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-semantic-error-primary mb-4 text-sm">{error}</p>
            <button
              onClick={fetchShows}
              className="text-sm text-brand-pixsee-secondary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-16 sm:py-24 px-4 border-2 border-dashed border-neutral-tertiary-border rounded-2xl">
            <Film className="w-12 h-12 text-neutral-tertiary-text mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-neutral-primary-text mb-2">
              No shows yet
            </h3>
            <p className="text-xs sm:text-sm text-neutral-tertiary-text mb-6">
              Create your first show to start earning on Pixsee
            </p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create a Show
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-neutral-tertiary-text mb-4 sm:mb-5">
              {shows.length} {shows.length === 1 ? "show" : "shows"}
            </p>
            {/* Landscape shows — wider cards, 2 per row */}
            {shows.filter((s) => s.video_format !== "portrait").length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 mb-6">
                {shows.filter((s) => s.video_format !== "portrait").map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>
            )}
            {/* Portrait shows — tall cards, 3-4 per row */}
            {shows.filter((s) => s.video_format === "portrait").length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {shows.filter((s) => s.video_format === "portrait").map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
