"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useInfiniteVideos } from "@/app/hooks/useVideo";
import { useWatchlist, useMe } from "@/app/hooks/useSocial";
import { ShowCardProps } from "@/app/utils";
import ShowCard from "./ShowCard";
import FilterTabs, { FilterTab } from "./FilterTabs";
import FeaturedShow from "./FeaturedShow";
import { Loader2 } from "lucide-react";

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
  trending: "-published_at",
  "most-watched": "-published_at",
  "top-voted": "-published_at",
};

const GENRE_TAG_MAP: Record<string, string> = {
  action: "action",
  drama: "drama",
  romance: "romance",
  comedy: "comedy",
  thriller: "thriller",
  others: "others",
};

function ShowCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-neutral-secondary animate-pulse aspect-3/4" />
      ))}
    </>
  );
}

function LandscapeSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-neutral-secondary animate-pulse aspect-video" />
      ))}
    </>
  );
}

function PortraitGrid({
  shows,
  getAccessToken,
  isInWatchlist,
  toggleWatchlist,
}: {
  shows: ShowCardProps[];
  getAccessToken: () => Promise<string | null>;
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (id: number) => void;
}) {
  if (!shows.length) return null;
  return (
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
  );
}

function LandscapeGrid({
  shows,
  getAccessToken,
  isInWatchlist,
  toggleWatchlist,
}: {
  shows: ShowCardProps[];
  getAccessToken: () => Promise<string | null>;
  isInWatchlist: (id: number) => boolean;
  toggleWatchlist: (id: number) => void;
}) {
  if (!shows.length) return null;
  return (
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
  );
}

const WatchPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const { user, getAccessToken } = useAuth();
  const { isInWatchlist, addShow, removeShow } = useWatchlist(getAccessToken);
  const { profile } = useMe(getAccessToken);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sort = SORT_MAP[activeFilter] ?? "-published_at";
  const filterTag = GENRE_TAG_MAP[activeFilter] ?? undefined;
  const filterFollowing = activeFilter === "following";

  const {
    shows,
    featuredShows,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteVideos({
    perPage: 20,
    sort,
    filterTag,
    filterFollowing,
    getAccessToken: filterFollowing ? getAccessToken : undefined,
  });

  // Intersection Observer for infinite scroll — only active after initial load
  useEffect(() => {
    if (isLoading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (tabId: string) => {
    setActiveFilter(tabId);
  };

  const getUserFirstName = () => {
    if (profile?.name) return profile.name.split(" ")[0];
    if (!user) return "there";
    if (user.email?.address) {
      const name = user.email.address.split("@")[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return "there";
  };

  const toggleWatchlist = (sid: number) => {
    isInWatchlist(sid) ? removeShow(sid) : addShow(sid);
  };

  const portraitShows = shows.filter((s) => s.videoFormat !== "landscape");
  const landscapeShows = shows.filter((s) => s.videoFormat === "landscape");

  // Main sections: always a fixed, stable slice — never changes as more pages load.
  // Round down to complete rows so no orphan cards appear in these sections.
  const portraitMainCount = Math.floor(Math.min(portraitShows.length, 8) / 4) * 4;
  const landscapeMainCount = Math.floor(Math.min(landscapeShows.length, 4) / 2) * 2;

  const portraitSectionShows = portraitShows.slice(0, portraitMainCount);
  const landscapeSectionShows = landscapeShows.slice(0, landscapeMainCount);

  // Trending: overflow beyond the main cap.
  // Only render each format's sub-grid when there are enough cards for a full row.
  const trendingPortraitRaw = portraitShows.slice(8);
  const trendingLandscapeRaw = landscapeShows.slice(4);

  const trendingPortrait = trendingPortraitRaw.length >= 4
    ? trendingPortraitRaw.slice(0, Math.floor(trendingPortraitRaw.length / 4) * 4)
    : [];
  const trendingLandscape = trendingLandscapeRaw.length >= 2
    ? trendingLandscapeRaw.slice(0, Math.floor(trendingLandscapeRaw.length / 2) * 2)
    : [];
  const hasTrending = trendingPortrait.length > 0 || trendingLandscape.length > 0;

  const activeTabLabel = filterTabs.find((t) => t.id === activeFilter)?.label;
  const sectionPrefix = filterTag ? `${activeTabLabel} · ` : "";

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
          <>
            <section className="mb-8 sm:mb-12">
              <div className="h-7 w-40 rounded-lg bg-neutral-secondary animate-pulse mb-6" />
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                <ShowCardSkeleton count={8} />
              </div>
            </section>
            <section className="mb-8 sm:mb-12">
              <div className="h-7 w-48 rounded-lg bg-neutral-secondary animate-pulse mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <LandscapeSkeleton count={4} />
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Reels & Shorts */}
            {portraitSectionShows.length > 0 && (
              <section className="mb-8 sm:mb-12">
                {/* <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
                  {sectionPrefix}Reels &amp; Shorts
                </h2> */}
                <PortraitGrid
                  shows={portraitSectionShows}
                  getAccessToken={getAccessToken}
                  isInWatchlist={isInWatchlist}
                  toggleWatchlist={toggleWatchlist}
                />
              </section>
            )}

            {/* Movies & Series */}
            {landscapeSectionShows.length > 0 && (
              <section className="mb-8 sm:mb-12">
                {/* <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
                  {sectionPrefix}Movies &amp; Series
                </h2> */}
                <LandscapeGrid
                  shows={landscapeSectionShows}
                  getAccessToken={getAccessToken}
                  isInWatchlist={isInWatchlist}
                  toggleWatchlist={toggleWatchlist}
                />
              </section>
            )}

            {/* Featured */}
            {featuredShows.length > 0 && (
              <section className="mb-8 sm:mb-12">
                <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
                  Featured shows
                </h2>
                <FeaturedShow shows={featuredShows} />
              </section>
            )}

            {/* Trending — only shown when there are enough remaining cards to fill a row */}
            {hasTrending && (
              <section className="mb-8 sm:mb-12">
                <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-4 sm:mb-6">
                  Trending
                </h2>
                {trendingPortrait.length > 0 && (
                  <div className="mb-6">
                    <PortraitGrid
                      shows={trendingPortrait}
                      getAccessToken={getAccessToken}
                      isInWatchlist={isInWatchlist}
                      toggleWatchlist={toggleWatchlist}
                    />
                  </div>
                )}
                {trendingLandscape.length > 0 && (
                  <LandscapeGrid
                    shows={trendingLandscape}
                    getAccessToken={getAccessToken}
                    isInWatchlist={isInWatchlist}
                    toggleWatchlist={toggleWatchlist}
                  />
                )}
              </section>
            )}
          </>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />

        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-tertiary-text" />
          </div>
        )}
      </div>

      <footer className="border-t border-neutral-tertiary-border" />
    </div>
  );
};

export default WatchPage;
