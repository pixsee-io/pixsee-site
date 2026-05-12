"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar, ChevronRight, ChevronLeft } from "lucide-react";

// ─── Mock data ──────────────────────────────────────────────────────────────

const categories = ["All", "Trending", "Top Voted", "New Drops", "Most Watched", "Following", "Others"];

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  thumbnailUrl: string;
  featured?: boolean;
};

const posts: Post[] = [
  {
    slug: "creator-economy-on-chain",
    title: "The Creator Economy Goes On-Chain: What Pixsee Means for Independent Filmmakers",
    excerpt: "For years, independent filmmakers have battled gatekeepers, opaque revenue models, and algorithmic obscurity. Pixsee's bonding curve model changes the math entirely.",
    category: "Trending",
    author: "Jason Francisco",
    date: "April 20, 2026",
    thumbnailUrl: "/images/trending-blog.png",
    featured: true,
  },
  {
    slug: "tix-tokens-explained",
    title: "TIX Tokens Explained: How Show Tokens Work on Pixsee",
    excerpt: "Every show on Pixsee has its own TIX token backed by a bonding curve. Here's a plain-English breakdown of how the economics work.",
    category: "New Drops",
    author: "Tracey Wilson",
    date: "April 18, 2026",
    thumbnailUrl: "/images/blog-2.png",
    featured: true,
  },
  {
    slug: "binge-plan-deep-dive",
    title: "Binge Plan: Watch Seamlessly Without Signing Every Transaction",
    excerpt: "Pixsee's upcoming Binge Plan will auto-unlock the next 10 minutes of a video as you watch — all behind the scenes, no popups.",
    category: "New Drops",
    author: "Elizabeth Slavin",
    date: "April 15, 2026",
    thumbnailUrl: "/images/blog-3.png",
    featured: true,
  },
  {
    slug: "why-base-blockchain",
    title: "Why We Built on Base: Speed, Cost, and the Coinbase Ecosystem",
    excerpt: "We evaluated five chains before choosing Base. Low fees, fast finality, and a growing DeFi ecosystem made it the obvious pick for a media platform.",
    category: "Top Voted",
    author: "Jason Francisco",
    date: "April 10, 2026",
    thumbnailUrl: "/images/blog-4.png",
  },
  {
    slug: "monetize-short-form",
    title: "Monetizing Short-Form Content: Reels and Shorts on Pixsee",
    excerpt: "Short-form doesn't have to mean low revenue. Here's how creators are using Pixsee's reel format to build audiences and earn from day one.",
    category: "Most Watched",
    author: "Ernie Smith",
    date: "April 8, 2026",
    thumbnailUrl: "/images/blog-5.png",
  },
  {
    slug: "trading-show-tokens",
    title: "Trading Show Tokens: Speculating on Creators You Believe In",
    excerpt: "Pixsee's Trade tab lets you buy and sell TIX tokens like any other asset. Early believers in a breakout creator can profit as their audience grows.",
    category: "Trending",
    author: "Eric Smith",
    date: "April 5, 2026",
    thumbnailUrl: "/images/blog-6.png",
  },
  {
    slug: "series-upload-guide",
    title: "Creator Guide: Uploading a Series to Pixsee",
    excerpt: "Step-by-step walkthrough for creating a multi-episode series, setting per-episode pricing, and getting your first TIX token on-chain.",
    category: "Following",
    author: "Tracey Wilson",
    date: "April 2, 2026",
    thumbnailUrl: "/images/blog-7.png",
  },
  {
    slug: "usdc-on-base",
    title: "Getting USDC on Base: A Beginner's Guide for Pixsee Viewers",
    excerpt: "New to crypto but want to watch paid content on Pixsee? Here's exactly how to get USDC on Base Sepolia to unlock episodes.",
    category: "Others",
    author: "Elizabeth Slavin",
    date: "March 28, 2026",
    thumbnailUrl: "/images/blog-8.png",
  },
  {
    slug: "bonding-curve-deep-dive",
    title: "Bonding Curves Demystified: The Math Behind Pixsee Pricing",
    excerpt: "What is a bonding curve, and why does it mean early viewers pay less? We break down the formula powering Pixsee's token economics.",
    category: "Top Voted",
    author: "Ernie Smith",
    date: "March 22, 2026",
    thumbnailUrl: "/images/blog-1.png",
  },
];

const featuredPosts = posts.filter((p) => p.featured);

// ─── TrendingSlider ──────────────────────────────────────────────────────────

function TrendingSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [sliding, setSliding] = useState(false);
  const lockRef = useRef(false);

  const go = useCallback((next: number, dir: "left" | "right" = "left") => {
    if (lockRef.current || next === current) return;
    lockRef.current = true;
    setDirection(dir);
    setSliding(true);
    setTimeout(() => {
      setCurrent(next);
      setSliding(false);
      lockRef.current = false;
    }, 400);
  }, [current]);

  const prev = () => go((current - 1 + featuredPosts.length) % featuredPosts.length, "right");
  const next = () => go((current + 1) % featuredPosts.length, "left");

  useEffect(() => {
    const id = setInterval(() => {
      go((current + 1) % featuredPosts.length, "left");
    }, 5000);
    return () => clearInterval(id);
  }, [current, go]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ minHeight: 340 }}>
      {/* Track — slides horizontally */}
      <div
        className="absolute inset-0 transition-transform duration-400 ease-in-out"
        style={{
          transform: sliding
            ? `translateX(${direction === "left" ? "-100%" : "100%"})`
            : "translateX(0%)",
        }}
      >
        <Image
          src={featuredPosts[current].thumbnailUrl}
          alt={featuredPosts[current].title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        <Link
          href={`/dashboard/blog/${featuredPosts[current].slug}`}
          className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 group"
        >
          <span className="inline-block px-3 py-0.5 rounded-full bg-brand-pixsee-secondary text-white text-xs font-medium mb-3 w-fit">
            {featuredPosts[current].category}
          </span>
          <h2 className="text-white font-paytone text-xl sm:text-2xl lg:text-3xl leading-snug mb-3 max-w-2xl">
            {featuredPosts[current].title}
          </h2>
          <div className="flex items-center gap-3 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-brand-pixsee-secondary flex items-center justify-center text-xs text-white font-semibold">
                {featuredPosts[current].author.charAt(0)}
              </div>
              <span>{featuredPosts[current].author}</span>
            </div>
            <span>·</span>
            <span>{featuredPosts[current].date}</span>
            <span className="ml-2 flex items-center gap-1 text-brand-pixsee-secondary font-medium group-hover:underline">
              Read blog <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </Link>
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {featuredPosts.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i, i < current ? "right" : "left")}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── PostCard ────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/dashboard/blog/${post.slug}`}
      className="group flex flex-col bg-neutral-primary border border-neutral-tertiary-border rounded-2xl overflow-hidden hover:border-brand-pixsee-secondary/40 transition-colors"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={post.thumbnailUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-brand-pixsee-secondary text-white text-xs font-medium">
          {post.category}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-neutral-primary-text text-sm sm:text-base leading-snug line-clamp-2 mb-2 group-hover:text-brand-pixsee-secondary transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-neutral-tertiary-text line-clamp-2 mb-4 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center gap-3 text-xs text-neutral-tertiary-text">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-brand-pixsee-secondary/20 flex items-center justify-center text-[10px] font-semibold text-brand-pixsee-secondary">
              {post.author.charAt(0)}
            </div>
            <span>{post.author}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{post.date}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = posts
    .filter((p) => activeCategory === "All" || p.category === activeCategory);

  return (
    <div className="min-h-screen bg-foundation-alternate pb-16">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-paytone text-neutral-primary-text">
            Stories & Insights
          </h1>
          <p className="text-neutral-tertiary-text text-sm mt-1">
            Ready to explore what's trending today?
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-brand-pixsee-secondary text-white"
                  : "bg-neutral-secondary text-neutral-secondary-text hover:text-neutral-primary-text border border-neutral-tertiary-border"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Trending slider — only on All tab */}
        {activeCategory === "All" && (
          <div className="mb-10">
            <h2 className="text-lg font-paytone text-neutral-primary-text mb-4">
              Trending Post
            </h2>
            <TrendingSlider />
          </div>
        )}

        {/* Latest posts grid */}
        <div>
          <h2 className="text-lg font-paytone text-neutral-primary-text mb-4">
            {activeCategory === "All" ? "Latest Post" : activeCategory}
          </h2>
          {filtered.length === 0 ? (
            <p className="text-neutral-tertiary-text text-sm py-12 text-center">
              No posts in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* View all */}
        {filtered.length > 0 && (
          <div className="flex justify-center mt-10">
            <button className="px-8 py-2.5 rounded-full border border-neutral-tertiary-border text-neutral-secondary-text hover:text-neutral-primary-text hover:border-neutral-primary-text transition-colors text-sm font-medium">
              View All Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
