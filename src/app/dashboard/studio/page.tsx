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

  return (
    <Link
      href={`/dashboard/studio/${show.id}`}
      className="group relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-brand-pixsee-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
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
            <Film className="w-10 h-10 text-neutral-400" />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              show.status === "published"
                ? "bg-green-500/90 text-white"
                : "bg-neutral-500/90 text-white"
            }`}
          >
            {show.status === "published" ? "Live" : "Draft"}
          </span>
        </div>

        {/* On-chain badge */}
        {isOnChain && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-pixsee-primary/90 text-white">
              On-chain
            </span>
          </div>
        )}

        {/* Episode count overlay */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
          <Play className="w-3 h-3" />
          {episodeCount} {episodeCount === 1 ? "episode" : "episodes"}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-neutral-900 dark:text-white truncate mb-1 group-hover:text-brand-pixsee-primary transition-colors">
          {show.title}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3 min-h-[2.5rem]">
          {show.description || "No description"}
        </p>

        <div className="flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {totalViews.toLocaleString()} views
            </span>
            <span className="capitalize">{show.type.replace("_", " ")}</span>
          </div>
          <span>{formatDate(show.created_at)}</span>
        </div>
      </div>

      {/* Edit hint */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isOnChain && (
          <div className="bg-white dark:bg-neutral-800 rounded-full p-1.5 shadow-md">
            <Pencil className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Studio
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Manage your shows and episodes
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="flex items-center gap-2 bg-brand-pixsee-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Show
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-pulse"
              >
                <div className="aspect-video bg-neutral-200 dark:bg-neutral-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchShows}
              className="text-sm text-brand-pixsee-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : shows.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <Film className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              No shows yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Create your first show to start earning on Pixsee
            </p>
            <Link
              href="/dashboard/create"
              className="inline-flex items-center gap-2 bg-brand-pixsee-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create a Show
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
              {shows.length} {shows.length === 1 ? "show" : "shows"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
