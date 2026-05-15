"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Users, Film, Eye } from "lucide-react";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import { formatCount } from "@/app/hooks/useVideo";
import { apiFetch } from "@/app/lib/apiClient";
import { queryKeys } from "@/app/lib/queryKeys";
import type { ShowCardProps } from "@/app/utils";
import type { ApiVideo } from "@/app/types/pixsee-api";

type CreatorProfile = {
  id: number;
  name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  created_at?: string;
  shows?: ApiVideo[];
};

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
      video.cover_image_url ?? video.thumbnail_url ?? video.cover_url ?? "/images/movie1.png",
    creatorName: creator?.name ?? creator?.username ?? "Unknown",
    creatorAvatar: creator?.avatar_url,
    views: formatCount(video.view_count),
    likes: formatCount(video.likes_count),
    description: video.description,
    isLiked: video.is_liked,
    videoFormat: isLandscape ? "landscape" : "portrait",
  };
}

export default function CreatorProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const { getAccessToken } = usePrivy();

  const profileQuery = useQuery({
    queryKey: queryKeys.profile.user(userId!),
    queryFn: async () => {
      const token = await getAccessToken().catch(() => null);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const json = await apiFetch<{ data?: CreatorProfile } | CreatorProfile>(
        `/api/v1/users/${userId}`,
        { headers }
      );
      return ((json as any)?.data ?? json) as CreatorProfile;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const showsQuery = useQuery({
    queryKey: queryKeys.profile.userShows(userId!),
    queryFn: async () => {
      const token = await getAccessToken().catch(() => null);
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const json = await apiFetch<{ data?: ApiVideo[]; shows?: ApiVideo[] }>(
          `/api/v1/users/${userId}/shows?per_page=50`,
          { headers }
        );
        const items = json.data ?? json.shows ?? [];
        return items.map(mapVideoToShowCard);
      } catch {
        // Fall back to embedded shows from profile if endpoint fails
        return (profileQuery.data?.shows ?? []).map(mapVideoToShowCard);
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  const profile = profileQuery.data ?? null;
  const shows = showsQuery.data ?? [];
  const isLoading = profileQuery.isLoading;
  const error = profileQuery.error ? String(profileQuery.error) : null;

  const displayName = profile?.name ?? profile?.username ?? "Creator";
  const portraitShows = shows.filter((s) => s.videoFormat !== "landscape");
  const landscapeShows = shows.filter((s) => s.videoFormat === "landscape");

  return (
    <div className="min-h-screen bg-foundation-alternate">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <Link
          href="javascript:history.back()"
          onClick={(e) => { e.preventDefault(); history.back(); }}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-secondary-text hover:text-neutral-primary-text mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </Link>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-neutral-secondary" />
              <div className="space-y-2">
                <div className="h-5 bg-neutral-secondary rounded w-40" />
                <div className="h-3 bg-neutral-secondary rounded w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-3/4 bg-neutral-secondary rounded-2xl" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-semantic-error-primary text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Profile header */}
            <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-secondary overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold text-neutral-secondary-text">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={displayName}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-paytone text-neutral-primary-text">{displayName}</h1>
                {profile?.username && profile.username !== profile.name && (
                  <p className="text-sm text-neutral-tertiary-text">@{profile.username}</p>
                )}
                {profile?.bio && (
                  <p className="text-sm text-neutral-secondary-text mt-1 line-clamp-2">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-tertiary-text">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {formatCount(profile?.followers_count ?? 0)} followers
                  </span>
                  <span className="flex items-center gap-1">
                    <Film className="w-3.5 h-3.5" />
                    {shows.length} {shows.length === 1 ? "show" : "shows"}
                  </span>
                </div>
              </div>
            </div>

            {/* Shows */}
            {shows.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-neutral-tertiary-border rounded-2xl">
                <Eye className="w-10 h-10 text-neutral-tertiary-text mx-auto mb-3" />
                <p className="text-sm text-neutral-tertiary-text">No published shows yet.</p>
              </div>
            ) : (
              <>
                {landscapeShows.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-base font-paytone text-neutral-primary-text mb-4">Movies & Series</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                      {landscapeShows.map((show) => (
                        <ShowCard key={show.id} {...show} />
                      ))}
                    </div>
                  </section>
                )}
                {portraitShows.length > 0 && (
                  <section>
                    <h2 className="text-base font-paytone text-neutral-primary-text mb-4">Reels & Shorts</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                      {portraitShows.map((show) => (
                        <ShowCard key={show.id} {...show} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
