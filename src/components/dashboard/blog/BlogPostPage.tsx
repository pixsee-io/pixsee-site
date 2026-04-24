"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, ChevronRight } from "lucide-react";

// Reuse the same mock data structure — in production this would come from a CMS/API
const posts: Record<string, {
  title: string;
  category: string;
  author: string;
  date: string;
  thumbnailUrl: string;
  content: React.ReactNode;
}> = {
  "creator-economy-on-chain": {
    title: "The Creator Economy Goes On-Chain: What Pixsee Means for Independent Filmmakers",
    category: "Trending",
    author: "Jason Francisco",
    date: "April 20, 2026",
    thumbnailUrl: "/images/featured-movie1.png",
    content: (
      <>
        <p>
          Traveling is an enriching experience that opens up new horizons, exposes us to different
          cultures, and creates memories that last a lifetime. However, traveling can also be
          stressful and overwhelming, especially if you don't plan and prepare adequately.
          In this blog article, we'll explore tips and tricks for a memorable journey and how to
          make the most of your travels.
        </p>
        <p>
          One of the most rewarding aspects of traveling is immersing yourself in the local culture
          and customs. This includes trying local cuisine, attending cultural events and festivals,
          and interacting with locals. Learning a few phrases in the local language can also go a
          long way in making connections and showing respect.
        </p>
        <h2>Research Your Destination</h2>
        <p>
          Before embarking on your journey, take the time to research your destination. This
          includes understanding the local culture, customs, and laws, as well as identifying top
          attractions, restaurants, and accommodations. Doing so will help you navigate your
          destination with confidence and avoid any cultural faux pas.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. In hendrerit gravida rutrum quisque non tellus orci ac
          auctor. Mi ipsum faucibus vitae aliquet nec ullamcorper sit amet. Aenean euismod
          elementum nisi quis eleifend quam adipiscing vitae. Viverra adipiscing at in tellus.
        </p>
        <h2>Plan Your Itinerary</h2>
        <p>
          While it's essential to leave room for spontaneity and unexpected adventures, having a
          rough itinerary can help you make the most of your time and budget. Identify the must-see
          sights and experiences and prioritize them according to your interests and preferences.
          This will help you avoid overscheduling and ensure that you have time to relax and enjoy
          your journey.
        </p>
        <p>
          Vitae sapien pellentesque habitant morbi tristique. Luctus venenatis lectus magna
          fringilla. Nec ullamcorper sit amet risus nullam eget felis. Tincidunt arcu non sodales
          neque sodales ut etiam sit amet.
        </p>
        <blockquote>
          "Traveling can expose you to new environments and potential health risks, so it's crucial
          to take precautions to stay safe and healthy."
        </blockquote>
        <h2>Pack Lightly and Smartly</h2>
        <p>
          Packing can be a daunting task, but with some careful planning and smart choices, you
          can pack light and efficiently. Start by making a packing list and sticking to it,
          focusing on versatile and comfortable clothing that can be mixed and matched. Invest in
          quality luggage and packing organizers to maximize space and minimize wrinkles.
        </p>
        <h2>Stay Safe and Healthy</h2>
        <p>
          Traveling can expose you to new environments and potential health risks, so it's crucial
          to take precautions to stay safe and healthy. This includes researching any required
          vaccinations or medications, staying hydrated, washing your hands frequently, and using
          sunscreen and insect repellent. It's also essential to keep your valuables safe and
          secure and to be aware of your surroundings at all times.
        </p>
        <h2>Immerse Yourself in the Local Culture</h2>
        <p>
          One of the most rewarding aspects of traveling is immersing yourself in the local culture
          and customs. This includes trying local cuisine, attending cultural events and festivals,
          and interacting with locals. Learning a few phrases in the local language can also go a
          long way in making connections and showing respect.
        </p>
        <h2>Capture Memories</h2>
        <p>
          Finally, don't forget to capture memories of your journey. Whether it's through
          photographs, journaling, or souvenirs, preserving the moments and experiences of your
          travels can bring joy and nostalgia for years to come. However, it's also essential to
          be present in the moment and not let technology distract you from the beauty of your
          surroundings.
        </p>
      </>
    ),
  },
};

// Fallback for unknown slugs — use first post's data
const fallbackPost = Object.values(posts)[0];

export default function BlogPostPage({ slug }: { slug: string }) {
  const router = useRouter();
  const post = posts[slug] ?? { ...fallbackPost };

  return (
    <div className="min-h-screen bg-foundation-alternate pb-16">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 flex flex-col">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-neutral-secondary-text hover:text-neutral-primary-text transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>

        <span className="w-fit px-3 py-0.5 rounded-full bg-brand-pixsee-secondary/10 text-brand-pixsee-secondary text-xs font-medium mb-4">
          {post.category}
        </span>

        <h1 className="text-2xl sm:text-3xl font-paytone text-neutral-primary-text leading-snug mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 text-sm text-neutral-tertiary-text mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-pixsee-secondary flex items-center justify-center text-white text-xs font-semibold">
              {post.author.charAt(0)}
            </div>
            <span>{post.author}</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.date}</span>
          </div>
        </div>

        {/* Featured image as card with gradient overlay matching the design */}
        <div className="relative w-full rounded-2xl overflow-hidden mb-10" style={{ minHeight: 280 }}>
          <Image
            src={post.thumbnailUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <span className="inline-block px-3 py-0.5 rounded-full bg-brand-pixsee-secondary text-white text-xs font-medium mb-2 w-fit">
              {post.category}
            </span>
            <h2 className="text-white font-paytone text-lg sm:text-xl leading-snug mb-2 max-w-lg">
              {post.title}
            </h2>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <div className="w-5 h-5 rounded-full bg-brand-pixsee-secondary flex items-center justify-center text-[10px] text-white font-semibold">
                {post.author.charAt(0)}
              </div>
              <span>{post.author}</span>
              <span>·</span>
              <span>{post.date}</span>
              <span className="flex items-center gap-0.5 text-brand-pixsee-secondary font-medium ml-2">
                Read blog <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Article content */}
        <article className="prose-custom text-neutral-secondary-text space-y-5 text-sm sm:text-base leading-relaxed">
          {post.content}
        </article>
      </div>

      {/* Prose styles injected via tailwind arbitrary — keep in global or here via style tag */}
      <style>{`
        .prose-custom h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-neutral-primary-text, #111);
          margin-top: 2rem;
          margin-bottom: 0.5rem;
        }
        .dark .prose-custom h2 {
          color: #f5f5f5;
        }
        .prose-custom blockquote {
          border-left: 3px solid var(--brand-pixsee-secondary, #7c3aed);
          padding: 1rem 1.5rem;
          background: rgba(124,58,237,0.05);
          border-radius: 0.5rem;
          font-style: italic;
          color: inherit;
          margin: 1.5rem 0;
        }
        .prose-custom p {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
