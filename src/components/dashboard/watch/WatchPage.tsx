"use client";

import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import FilterTabs, { FilterTab } from "@/components/dashboard/watch/FilterTabs";
import FeaturedShow from "@/components/dashboard/watch/FeaturedShow";
import { useVideos } from "@/app/hooks/useVideo";

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

// Map filter tab IDs to API sort/filter params where applicable
const SORT_MAP: Record<string, string> = {
  "new-drops": "-published_at",
  "most-watched": "-views_count",
  "top-voted": "-likes_count",
  trending: "-views_count",
};

const WatchPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { user } = usePrivy();

  const sort = SORT_MAP[activeFilter] ?? "-published_at";

  const { shows, featuredShows, isLoading, error, meta } = useVideos({
    page,
    perPage: 20,
    sort,
  });

  const getUserFirstName = () => {
    if (!user) return "there";
    if (user.email?.address) {
      const name = user.email.address.split("@")[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return "there";
  };

  const handleFilterChange = (tabId: string) => {
    setActiveFilter(tabId);
    setPage(1); // reset pagination on filter change
  };

  const hasMore = meta ? page < meta.last_page : false;

  return (
    <div className="min-h-screen bg-foundation-alternate">
      <div className="max-w-400 mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="mb-6">
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
          className="mb-8"
        />

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-semantic-error-primary/10 text-semantic-error-primary text-sm">
            {error}
          </div>
        )}

        {/* Main grid */}
        <section className="mb-12">
          {isLoading ? (
            <ShowCardSkeleton count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {shows.map((show) => (
                <ShowCard key={show.id} {...show} />
              ))}
            </div>
          )}

          {hasMore && !isLoading && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full px-8 py-4 border-neutral-secondary-border bg-transparent hover:bg-neutral-secondary text-neutral-secondary-text"
              >
                View More Shows
              </Button>
            </div>
          )}
        </section>

        {/* Featured / top show of the week */}
        {featuredShows.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-6">
              Top show of the week
            </h2>
            <FeaturedShow shows={featuredShows} />
          </section>
        )}

        {/* For you — second slice */}
        {shows.length > 4 && (
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-6">
              For you
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {shows.slice(0, 4).map((show) => (
                <ShowCard key={`for-you-${show.id}`} {...show} />
              ))}
            </div>
          </section>
        )}

        {/* Trending — third slice */}
        {shows.length > 8 && (
          <section className="mb-12">
            <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-6">
              Trending
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {shows.slice(4, 8).map((show) => (
                <ShowCard key={`trending-${show.id}`} {...show} />
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="border-t border-neutral-tertiary-border" />
    </div>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────

function ShowCardSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-md animate-pulse">
          <div className="aspect-3/4 rounded-t-2xl bg-neutral-200" />
          <div className="p-5 space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-3/4" />
            <div className="h-3 bg-neutral-200 rounded w-1/2" />
            <div className="h-3 bg-neutral-200 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default WatchPage;
