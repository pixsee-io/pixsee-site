"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import FilterTabs, { FilterTab } from "@/components/dashboard/watch/FilterTabs";
import FeaturedShow from "@/components/dashboard/watch/FeaturedShow";
import { useVideos } from "@/app/hooks/useVideo";
import { useWatchlist, useMe } from "@/app/hooks/useSocial";
import { ShowCardProps } from "@/app/utils";

const filterTabs: FilterTab[] = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "top-voted", label: "Top Voted" },
  { id: "new-drops", label: "New Drops" },
  { id: "most-watched", label: "Most Watched" },
  { id: "following", label: "Following" },
  { id: "action", label: "Action" },
  { id: "drama", label: "Drama" },
  { id: "romance", label: "Romance" },
  { id: "comedy", label: "Comedy" },
  { id: "thriller", label: "Thriller" },
  { id: "others", label: "Others" },
];

const SORT_MAP: Record<string, string> = {
  "new-drops": "-published_at",
  "most-watched": "-views_count",
  "top-voted": "-likes_count",
  trending: "-views_count",
};

// Skeleton loader
function ShowCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-neutral-secondary animate-pulse aspect-3/4"
        />
      ))}
    </>
  );
}

// Row of portrait cards (tall, 4-wide on xl)
function PortraitRow({
  shows,
  label,
  getAccessToken,
  isInWatchlist,
  toggleWatchlist,
}: {
  shows: ShowCardProps[];
  label: string;
  getAccessToken: () => Promise<string | null>;
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (id: number) => void;
}) {
  if (!shows.length) return null;
  return (
    <section className="mb-8 sm:mb-12">
      <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
        {label}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {shows.map((show) => (
          <ShowCard
            key={show.id}
            {...show}
            getAccessToken={getAccessToken}
            inWatchlist={isInWatchlist(parseInt(show.id))}
            onWatchlistToggle={() => toggleWatchlist(parseInt(show.id))}
          />
        ))}
      </div>
    </section>
  );
}

// Row of landscape cards (wide, 2-wide on xl — each card takes half the width)
function LandscapeRow({
  shows,
  label,
  getAccessToken,
  isInWatchlist,
  toggleWatchlist,
}: {
  shows: ShowCardProps[];
  label: string;
  getAccessToken: () => Promise<string | null>;
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (id: number) => void;
}) {
  if (!shows.length) return null;
  return (
    <section className="mb-8 sm:mb-12">
      <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
        {label}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {shows.map((show) => (
          <ShowCard
            key={show.id}
            {...show}
            getAccessToken={getAccessToken}
            inWatchlist={isInWatchlist(parseInt(show.id))}
            onWatchlistToggle={() => toggleWatchlist(parseInt(show.id))}
          />
        ))}
      </div>
    </section>
  );
}

const WatchPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { user, getAccessToken } = useAuth();
  const { isInWatchlist, addShow, removeShow } = useWatchlist(getAccessToken);
  const { profile } = useMe(getAccessToken);

  const sort = SORT_MAP[activeFilter] ?? "-published_at";

  const { shows, featuredShows, isLoading, error, meta } = useVideos({
    page,
    perPage: 20,
    sort,
  });

  const getUserFirstName = () => {
    if (profile?.name) return profile.name.split(" ")[0];
    if (!user) return "there";
    if (user.email?.address) {
      const name = user.email.address.split("@")[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return "there";
  };

  const handleFilterChange = (tabId: string) => {
    setActiveFilter(tabId);
    setPage(1);
  };

  const hasMore = meta ? page < meta.last_page : false;

  const toggleWatchlist = (sid: number) => {
    isInWatchlist(sid) ? removeShow(sid) : addShow(sid);
  };

  // Split shows by format
  const portraitShows = shows.filter((s) => s.videoFormat !== "landscape");
  const landscapeShows = shows.filter((s) => s.videoFormat === "landscape");

  return (
    <div className="min-h-screen bg-foundation-alternate">
      <div className="max-w-400 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl md:text-3xl font-paytone text-neutral-primary-text">
            Hey {getUserFirstName()} 👋
          </h1>
          <p className="text-sm md:text-base text-neutral-secondary-text mt-1">
            Ready to explore what&apos;s trending today?
          </p>
        </div>

        <FilterTabs
          tabs={filterTabs}
          activeTab={activeFilter}
          onTabChange={handleFilterChange}
          className="mb-6 sm:mb-8"
        />

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-semantic-error-primary/10 text-semantic-error-primary text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-12">
            <ShowCardSkeleton count={8} />
          </div>
        ) : (
          <>
            {/* Portrait shows */}
            <PortraitRow
              shows={portraitShows}
              label="Reels & Shorts"
              getAccessToken={getAccessToken}
              isInWatchlist={isInWatchlist}
              toggleWatchlist={toggleWatchlist}
            />

            {/* Landscape shows — wider cards, fewer per row */}
            <LandscapeRow
              shows={landscapeShows}
              label="Movies & Series"
              getAccessToken={getAccessToken}
              isInWatchlist={isInWatchlist}
              toggleWatchlist={toggleWatchlist}
            />
          </>
        )}

        {hasMore && !isLoading && (
          <div className="flex justify-center mt-2 mb-8">
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full px-8 py-4 border-neutral-secondary-border bg-transparent hover:bg-neutral-secondary text-neutral-secondary-text"
            >
              View More Shows
            </Button>
          </div>
        )}

        {/* Featured / top show of the week */}
        {featuredShows.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-6">
              Top show of the week
            </h2>
            <FeaturedShow shows={featuredShows} />
          </section>
        )}
      </div>

      <footer className="border-t border-neutral-tertiary-border" />
    </div>
  );
};

export default WatchPage;
