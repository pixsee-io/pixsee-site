"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Play,
  Star,
  Share2,
  Eye,
  Heart,
  MessageCircle,
  Tv,
  Coins,
  Calendar,
  Lock,
  Gift,

} from "lucide-react";
import ShowCard from "./ShowCard";

// Types
type Genre = string;

type Episode = {
  id: string;
  number: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  views: string;
  uploadedAt: string;
  earnAmount: string;
  progress: number; // 0-100
  isLocked?: boolean;
};

type Creator = {
  id: string;
  name: string;
  avatarUrl: string;
  bio: string;
  followers: string;
  views: string;
  pixEarned: string;
  socials: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
};

type Comment = {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
    isTopFan?: boolean;
  };
  content: string;
  likes: number;
  timestamp: string;
  replies?: Comment[];
};

type ShowDetailsData = {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  bannerUrl: string;
  genres: Genre[];
  creator: Creator;
  stats: {
    views: string;
    likes: string;
    comments: string;
    episodes: string;
    pixEarned: string;
  };
  episodes: Episode[];
  userProgress: {
    episodesWatched: number;
    totalEpisodes: number;
    totalEarned: string;
    nextReward: string;
  };
  comments: Comment[];
  otherShows: Array<{
    id: string;
    title: string;
    thumbnailUrl: string;
    creatorName: string;
    views: string;
    likes: string;
    genre?: string;
    episodeCount?: number;
    description?: string;
  }>;
};

type ShowDetailsProps = {
  show: ShowDetailsData;
};

const StatBadge = ({
  icon: Icon,
  label,
  value,
  valueColor = "text-brand-pixsee-secondary",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-tertiary-border">
    <span className="text-sm text-neutral-secondary-text">{label}</span>
    <Icon className="w-4 h-4 text-neutral-tertiary-text" />
    <span className={cn("text-sm font-semibold", valueColor)}>{value}</span>
  </div>
);

const EpisodeCard = ({ episode }: { episode: Episode }) => (
  <div className="flex gap-4 p-4 bg-foundation-alternate rounded-xl border border-neutral-tertiary-border">
    <div className="relative w-32 h-20 md:w-40 md:h-24 rounded-lg overflow-hidden flex-shrink-0">
      <Image
        src={episode.thumbnailUrl}
        alt={episode.title}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
          {episode.isLocked ? (
            <Lock className="w-4 h-4 text-neutral-tertiary-text" />
          ) : (
            <Play className="w-4 h-4 text-brand-pixsee-secondary fill-brand-pixsee-secondary" />
          )}
        </div>
      </div>
      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
        {episode.duration}
      </div>
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-neutral-tertiary-text">
            Episode {episode.number}
          </p>
          <h4 className="font-semibold text-brand-pixsee-secondary">
            {episode.title}
          </h4>
        </div>
        <span className="text-xs text-brand-pixsee-secondary bg-brand-pixsee-tertiary px-2 py-1 rounded flex-shrink-0">
          Earn {episode.earnAmount}
        </span>
      </div>

      <p className="text-sm text-neutral-secondary-text line-clamp-2 mt-1">
        {episode.description}
      </p>

      <div className="flex items-center gap-4 mt-2 text-xs text-neutral-tertiary-text">
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          {episode.views}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {episode.uploadedAt}
        </span>
      </div>

      {episode.progress > 0 && (
        <div className="mt-2 h-1 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full"
            style={{ width: `${episode.progress}%` }}
          />
        </div>
      )}
    </div>
  </div>
);

const CommentCard = ({ comment }: { comment: Comment }) => (
  <div className="p-4 bg-neutral-secondary rounded-xl">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
        <Image
          src={comment.author.avatarUrl}
          alt={comment.author.name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-primary-text">
            {comment.author.name}
          </span>
          {comment.author.isTopFan && (
            <span className="text-xs bg-brand-pixsee-secondary text-white px-2 py-0.5 rounded">
              Top Fan
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-secondary-text mt-1">
          {comment.content}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-tertiary-text">
          <button className="flex items-center gap-1 hover:text-semantic-error-primary transition-colors">
            <Heart className="w-3.5 h-3.5" />
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

const ShowDetails = ({ show }: ShowDetailsProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeCommentTab, setActiveCommentTab] = useState<
    "top" | "recents" | "following"
  >("top");
  const [newComment, setNewComment] = useState("");

  const progressPercentage =
    (show.userProgress.episodesWatched / show.userProgress.totalEpisodes) * 100;

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 py-4">
        <Link
          href="/dashboard/watch"
          className="inline-flex items-center gap-2 text-neutral-secondary-text hover:text-neutral-primary-text transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Go back</span>
        </Link>
      </div>

      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden aspect-21/9 md:aspect-3/1">
          <Image
            src={show.bannerUrl}
            alt={show.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="p-6 md:p-8 lg:p-12 max-w-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-paytone text-white mb-3">
                {show.title}
              </h1>
              <p className="text-white/80 text-sm md:text-base line-clamp-3 mb-4">
                {show.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {show.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-neutral-inverse-primary text-white text-sm rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-6 py-2 gap-2">
                  <Play className="w-4 h-4 fill-white" />
                  Play now
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-full px-4 py-2 gap-2"
                >
                  <Star className="w-4 h-4" />
                  Add to watchlist
                </Button>
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-full px-4 py-2 gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-350 mx-auto px-4 md:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 flex flex-col">
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
              About the show
            </h2>
            <p className="text-neutral-secondary-text leading-relaxed flex-1">
              {showFullDescription
                ? show.fullDescription
                : `${show.fullDescription.slice(0, 300)}...`}
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-brand-pixsee-secondary hover:underline ml-1"
              >
                {showFullDescription ? "Show Less" : "Read More"}
              </button>
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <StatBadge icon={Eye} label="Views" value={show.stats.views} />
              <StatBadge icon={Heart} label="Likes" value={show.stats.likes} />
              <StatBadge
                icon={MessageCircle}
                label="Comments"
                value={show.stats.comments}
                valueColor="text-semantic-error-primary"
              />
              <StatBadge
                icon={Tv}
                label="Episodes"
                value={show.stats.episodes}
                valueColor="text-semantic-error-primary"
              />
              <StatBadge
                icon={Coins}
                label="$PIX Earned"
                value={show.stats.pixEarned}
                valueColor="text-semantic-success-text"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 flex flex-col">
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
              About the Creator
            </h2>

            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-full overflow-hidden shrink-0">
                <Image
                  src={show.creator.avatarUrl}
                  alt={show.creator.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-primary-text">
                  {show.creator.name}
                </h3>
                <p className="text-sm text-neutral-tertiary-text">
                  {show.creator.bio}
                </p>
              </div>
            </div>

            {/* Creator Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 flex-1">
              <div className="text-center">
                <p className="text-lg font-bold text-brand-pixsee-secondary">
                  {show.creator.followers}
                </p>
                <p className="text-xs text-neutral-tertiary-text">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-brand-pixsee-secondary">
                  {show.creator.views}
                </p>
                <p className="text-xs text-neutral-tertiary-text">Views</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-semantic-success-text">
                  {show.creator.pixEarned}
                </p>
                <p className="text-xs text-neutral-tertiary-text">
                  $PIX Earned
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full rounded-lg border-brand-pixsee-secondary text-brand-pixsee-secondary hover:bg-brand-pixsee-secondary hover:text-white gap-2"
            >
              <span>👤</span>
              Follow creator
            </Button>

            <div className="mt-5 flex items-center justify-center gap-3">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                aria-label="Instagram"
              >
                <Image
                  src="/icons/pixsee_instagram.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                aria-label="X (Twitter)"
              >
                <Image
                  src="/images/x-logo.png"
                  alt="X"
                  width={24}
                  height={24}
                />
              </Link>
              <Link
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                aria-label="Discord"
              >
                <Image
                  src="/icons/pixsee_discord.svg"
                  alt="Discord"
                  width={24}
                  height={24}
                />
              </Link>
              <Link
                href="https://pixsee.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-black/10 border-[1.5px] border-neutral-secondary-border flex items-center justify-center hover:border-neutral-primary-border hover:scale-105 transition-all shadow-lg"
                aria-label="Website"
              >
                <Image
                  src="/icons/pixsee_tiktok.svg"
                  alt="Website"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Episodes List */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-paytone text-neutral-primary-text">
                  Episodes
                </h2>
                <div className="w-6 h-6 rounded-full bg-brand-pixsee-secondary flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              </div>

              <div className="space-y-4">
                {show.episodes.map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} />
                ))}
              </div>
            </div>

            <div className=" rounded-2xl p-6 ">
              <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
                Your Progress
              </h2>

              {/* Circular Progress */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#e6e6e6"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="#22c55e"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${progressPercentage * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-neutral-primary-text">
                      {show.userProgress.episodesWatched}/
                      {show.userProgress.totalEpisodes}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-neutral-secondary-text mt-2">
                  Episodes Watched
                </p>
                <Button
                  variant="link"
                  className="text-brand-pixsee-secondary text-sm"
                >
                  Continue Watching
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-secondary rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-brand-pixsee-tertiary flex items-center justify-center">
                    <Coins className="w-5 h-5 text-brand-pixsee-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-tertiary-text">
                      Total Earned
                    </p>
                    <p className="font-bold text-brand-pixsee-secondary">
                      {show.userProgress.totalEarned}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-neutral-secondary rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-semantic-warning-subtle flex items-center justify-center">
                    <Lock className="w-5 h-5 text-semantic-warning-text" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-tertiary-text">
                      Next reward
                    </p>
                    <p className="font-semibold text-neutral-primary-text">
                      {show.userProgress.nextReward}
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6 bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg gap-2">
                Claim Rewards
                <Gift className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-paytone text-neutral-primary-text">
              Comments
            </h2>

            <MessageCircle size={18} />
            <span className="text-semantic-error-primary">
              {show.stats.comments}
            </span>
          </div>

          <div className="flex gap-6 mb-6 border-b border-neutral-tertiary-border">
            {(["top", "recents", "following"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCommentTab(tab)}
                className={cn(
                  "pb-3 text-sm font-medium capitalize transition-colors",
                  activeCommentTab === tab
                    ? "text-neutral-primary-text border-b-2 border-black"
                    : "text-neutral-tertiary-text hover:text-neutral-secondary-text"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src='/images/alex-chen.svg'
                alt='alex'
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="text"
              placeholder="Add Comments................"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-4 py-4 bg-neutral-secondary rounded-lg border border-neutral-tertiary-border focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
            />
            <Button className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg px-4 gap-2">
              Post Comments
              <span>+</span>
            </Button>
          </div>

          <div className="space-y-4">
            {show.comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-8">
              Load more comments
            </Button>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
            Other Shows from Creator
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {show.otherShows.map((otherShow) => (
              <ShowCard key={otherShow.id} {...otherShow} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowDetails;
