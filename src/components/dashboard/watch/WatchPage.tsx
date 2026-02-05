"use client";

import React, { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import ShowCard from "@/components/dashboard/watch/ShowCard";
import FilterTabs, { FilterTab } from "@/components/dashboard/watch/FilterTabs";
import FeaturedShow from "@/components/dashboard/watch/FeaturedShow";
import { featuredShows, mockShows } from "@/app/utils";

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

const WatchPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const { user } = usePrivy();

  // Get user's first name
  const getUserFirstName = () => {
    if (!user) return "there";

    // Check for email and extract name part
    if (user.email?.address) {
      const emailName = user.email.address.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    // Fallback
    return "there";
  };

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
          onTabChange={setActiveFilter}
          className="mb-8"
        />

        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {mockShows.map((show) => (
              <ShowCard key={show.id} {...show}  />
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              className="rounded-full px-8 py-4 border-neutral-secondary-border bg-transparent hover:bg-neutral-secondary text-neutral-secondary-text"
            >
              View More Shows
            </Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-6">
            Top show of the week
          </h2>
          <FeaturedShow shows={featuredShows} />
        </section>

        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-6">
            For you
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {mockShows.slice(0, 4).map((show) => (
              <ShowCard key={`for-you-${show.id}`} {...show} />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-paytone text-neutral-primary-text mb-6">
            Trending
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
            {mockShows.slice(4, 8).map((show) => (
              <ShowCard key={`trending-${show.id}`} {...show} />
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-neutral-tertiary-border"></footer>
    </div>
  );
};

export default WatchPage;
