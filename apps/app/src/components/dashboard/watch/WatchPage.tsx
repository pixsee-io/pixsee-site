"use client";

import React, { useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useVideos } from "@/app/hooks/useVideo";
import { useWatchlist, useMe } from "@/app/hooks/useSocial";
import { ShowCardProps } from "@/app/utils";
import ShowCard from "./ShowCard";
import FilterTabs, { FilterTab } from "./FilterTabs";
import FeaturedShow from "./FeaturedShow";

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

// Shared horizontal scroll row — one strip of 10 cards, no wrapping
function HScrollRow({
  shows,
  cardClassName,
  getAccessToken,
  isInWatchlist,
  toggleWatchlist,
}: {
  shows: ShowCardProps[];
  cardClassName: string;
  getAccessToken: () => Promise<string | null>;
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (id: number) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-3 px-3 sm:-mx-4 sm:px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      {shows.map((show) => (
        <div key={show.id} className={`shrink-0 ${cardClassName}`}>
          <ShowCard
            {...show}
            getAccessToken={getAccessToken}
            inWatchlist={isInWatchlist(parseInt(show.id))}
            onWatchlistToggle={() => toggleWatchlist(parseInt(show.id))}
          />
        </div>
      ))}
    </div>
  );
}

// ≤ 8 → standard grid; > 8 → two horizontal scroll rows of 10
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

  const useScroll = shows.length > 8;
  const row1 = shows.slice(0, 10);
  const row2 = shows.slice(10, 20);

  return (
    <section className="mb-8 sm:mb-12">
      <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
        {label}
      </h2>
      {useScroll ? (
        <div className="space-y-4">
          <HScrollRow
            shows={row1}
            cardClassName="w-48 sm:w-52 md:w-60"
            getAccessToken={getAccessToken}
            isInWatchlist={isInWatchlist}
            toggleWatchlist={toggleWatchlist}
          />
          {row2.length > 0 && (
            <HScrollRow
              shows={row2}
              cardClassName="w-48 sm:w-52 md:w-60"
              getAccessToken={getAccessToken}
              isInWatchlist={isInWatchlist}
              toggleWatchlist={toggleWatchlist}
            />
          )}
        </div>
      ) : (
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
      )}
    </section>
  );
}

// Row of landscape cards (wide)
// ≤ 4 → standard grid; > 4 → two horizontal scroll rows of 10
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

  const useScroll = shows.length > 4;
  const row1 = shows.slice(0, 10);
  const row2 = shows.slice(10, 20);

  return (
    <section className="mb-8 sm:mb-12">
      <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
        {label}
      </h2>
      {useScroll ? (
        <div className="space-y-4">
          <HScrollRow
            shows={row1}
            cardClassName="w-[340px] sm:w-[400px] md:w-[480px]"
            getAccessToken={getAccessToken}
            isInWatchlist={isInWatchlist}
            toggleWatchlist={toggleWatchlist}
          />
          {row2.length > 0 && (
            <HScrollRow
              shows={row2}
              cardClassName="w-[340px] sm:w-[400px] md:w-[480px]"
              getAccessToken={getAccessToken}
              isInWatchlist={isInWatchlist}
              toggleWatchlist={toggleWatchlist}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
      )}
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

            <LandscapeRow
              shows={landscapeShows}
              label="Movies & Series"
              getAccessToken={getAccessToken}
              isInWatchlist={isInWatchlist}
              toggleWatchlist={toggleWatchlist}
            />
          </>
        )}

        {/* Featured / top show of the week */}
        {featuredShows.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-6">
              Featured shows
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
