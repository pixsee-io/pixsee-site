"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MuxPlayer from "@mux/mux-player-react";
import {
  ArrowLeft,
  Star,
  Share2,
  Eye,
  Heart,
  MessageCircle,
  Coins,
  Clock,
  Tag,
  Loader2,
} from "lucide-react";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import { formatCount, getCreator, useVideo, useVideos } from "@/app/hooks/useVideo";


function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}


const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  title,
}: {
  playbackId: string | null;
  thumbnailUrl: string | null;
  title: string;
}) => {
  if (!playbackId) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover opacity-30"
          />
        )}
        <div className="relative z-10 text-center px-6">
          <Loader2 className="w-10 h-10 text-white/50 animate-spin mx-auto mb-3" />
          <p className="text-white/50 text-sm">Video processing…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
      <MuxPlayer
        playbackId={playbackId}
        poster={thumbnailUrl ?? undefined}
        style={{ width: "100%", height: "100%" }}
        streamType="on-demand"
        preferPlayback="mse"
      />
    </div>
  );
};


const ShowDetailsSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="w-full aspect-video bg-neutral-tertiary rounded-2xl" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="h-7 bg-neutral-tertiary rounded w-2/3" />
        <div className="h-4 bg-neutral-tertiary rounded w-1/3" />
        <div className="h-24 bg-neutral-tertiary rounded" />
      </div>
      <div className="h-48 bg-neutral-tertiary rounded-2xl" />
    </div>
  </div>
);

// ─── Comment types (static for now until comments API is available) ─────────

type Comment = {
  id: string;
  author: { name: string; avatarUrl: string; isTopFan?: boolean };
  content: string;
  likes: number;
  timestamp: string;
};

const CommentCard = ({ comment }: { comment: Comment }) => (
  <div className="p-3 sm:p-4 bg-neutral-secondary rounded-xl">
    <div className="flex items-start gap-2.5 sm:gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-neutral-tertiary flex items-center justify-center text-sm font-semibold text-neutral-secondary-text">
        {comment.author.avatarUrl ? (
          <Image
            src={comment.author.avatarUrl}
            alt={comment.author.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          comment.author.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-neutral-primary-text">
            {comment.author.name}
          </span>
          {comment.author.isTopFan && (
            <span className="text-[10px] bg-brand-pixsee-secondary text-white px-2 py-0.5 rounded">
              Top Fan
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-neutral-secondary-text mt-1">
          {comment.content}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-tertiary-text">
          <button className="flex items-center gap-1 hover:text-semantic-error-primary transition-colors">
            <Heart className="w-3 h-3" />
            {comment.likes}
          </button>
          <button className="hover:text-neutral-primary-text transition-colors">
            Reply
          </button>
          <span>{comment.timestamp}</span>
        </div>
      </div>
    </div>
  </div>
);


type ShowDetailsProps = {
  id: string;
};

const ShowDetails = ({ id }: ShowDetailsProps) => {
  const router = useRouter();
  const { video, isLoading, error } = useVideo(id);
  const { shows: relatedShows } = useVideos({
    perPage: 8,
    sort: "-published_at",
  });
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeCommentTab, setActiveCommentTab] = useState<
    "top" | "recents" | "following"
  >("top");
  const [newComment, setNewComment] = useState("");

  const related = relatedShows.filter((s) => s.id !== id).slice(0, 4);

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-semantic-error-primary mb-4">
          Failed to load video.
        </p>
        <button
          onClick={() => router.back()}
          className="text-brand-pixsee-secondary underline text-sm"
        >
          Go back
        </button>
      </div>
    );
  }

  const playbackId = video?.mux_playback_id ?? null;
  const creator = video ? getCreator(video) : null;
  const description = video?.description ?? "";
  const truncated = description.length > 300;

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-350 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        <Link
          href="/dashboard/watch"
          className="inline-flex items-center gap-2 text-neutral-secondary-text hover:text-neutral-primary-text transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Go back</span>
        </Link>
      </div>

      <div className="max-w-350 mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {isLoading ? (
          <ShowDetailsSkeleton />
        ) : (
          <>
            <VideoPlayer
              playbackId={playbackId}
              thumbnailUrl={video?.thumbnail_url ?? null}
              title={video?.title ?? ""}
            />

            {/* ── Title + actions ── */}
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-3xl font-paytone text-neutral-primary-text">
                  {video?.title}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  {video?.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-0.5 bg-neutral-secondary rounded-full text-xs text-neutral-secondary-text"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border-neutral-tertiary-border rounded-full px-3 sm:px-4 py-1.5 gap-1.5 text-xs sm:text-sm"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Watchlist</span>
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 border-neutral-tertiary-border rounded-full px-3 sm:px-4 py-1.5 gap-1.5 text-xs sm:text-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </Button>
              </div>
            </div>

            {/* ── Info grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
              <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text mb-3">
                  About this video
                </h2>
                <p className="text-sm sm:text-base text-neutral-secondary-text leading-relaxed flex-1">
                  {showFullDescription || !truncated
                    ? description
                    : `${description.slice(0, 300)}...`}
                  {truncated && (
                    <button
                      onClick={() =>
                        setShowFullDescription(!showFullDescription)
                      }
                      className="text-brand-pixsee-secondary hover:underline ml-1"
                    >
                      {showFullDescription ? "Show Less" : "Read More"}
                    </button>
                  )}
                  {!description && (
                    <span className="text-neutral-tertiary-text italic">
                      No description provided.
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
                  {/* Views */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-neutral-tertiary-border">
                    <span className="text-xs text-neutral-secondary-text">
                      Views
                    </span>
                    <Eye className="w-4 h-4 text-neutral-tertiary-text" />
                    <span className="text-xs font-semibold text-brand-pixsee-secondary">
                      {formatCount(video?.view_count)}
                    </span>
                  </div>
                  {/* Duration */}
                  {video?.duration && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-neutral-tertiary-border">
                      <span className="text-xs text-neutral-secondary-text">
                        Duration
                      </span>
                      <Clock className="w-4 h-4 text-neutral-tertiary-text" />
                      <span className="text-xs font-semibold text-brand-pixsee-secondary">
                        {formatDuration(video.duration)}
                      </span>
                    </div>
                  )}
                  {/* Free/Paid */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-neutral-tertiary-border">
                    <span className="text-xs text-neutral-secondary-text">
                      Access
                    </span>
                    <Coins className="w-4 h-4 text-neutral-tertiary-text" />
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        video?.is_free
                          ? "text-semantic-success-text"
                          : "text-brand-pixsee-secondary"
                      )}
                    >
                      {video?.is_free ? "Free" : `${video?.token_price} SPIX`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Creator card */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text mb-3">
                  Creator
                </h2>
                {creator ? (
                  <>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-neutral-tertiary overflow-hidden shrink-0 flex items-center justify-center text-lg font-semibold text-neutral-secondary-text">
                        {creator.avatar ? (
                          <Image
                            src={creator.avatar}
                            alt={creator.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          creator.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-primary-text">
                          {creator.name}
                        </h3>
                        <p className="text-xs text-neutral-tertiary-text">
                          Video Creator
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-lg border-brand-pixsee-secondary text-brand-pixsee-secondary hover:bg-brand-pixsee-secondary hover:text-white gap-2 text-sm mt-auto"
                    >
                      <span>👤</span> Follow creator
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-neutral-tertiary-text italic">
                    Creator info unavailable
                  </p>
                )}
              </div>
            </div>

            {/* ── Related videos ── */}
            {related.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
                  More to watch
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {related.map((show) => (
                    <ShowCard key={show.id} {...show} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Comments ── */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-paytone text-neutral-primary-text">
                  Comments
                </h2>
                <MessageCircle size={16} />
                <span className="text-sm text-semantic-error-primary">0</span>
              </div>
              <div className="flex gap-4 sm:gap-6 mb-4 border-b border-neutral-tertiary-border">
                {(["top", "recents", "following"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCommentTab(tab)}
                    className={cn(
                      "pb-2.5 text-xs sm:text-sm font-medium capitalize transition-colors",
                      activeCommentTab === tab
                        ? "text-neutral-primary-text border-b-2 border-black"
                        : "text-neutral-tertiary-text hover:text-neutral-secondary-text"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-brand-pixsee-secondary flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  Y
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-neutral-secondary rounded-lg border border-neutral-tertiary-border focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
                  />
                </div>
                <Button className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg px-4 text-sm hidden sm:flex">
                  Post
                </Button>
              </div>
              <p className="text-sm text-neutral-tertiary-text text-center py-6 italic">
                No comments yet. Be the first!
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShowDetails;
