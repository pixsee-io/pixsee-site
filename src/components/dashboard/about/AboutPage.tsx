"use client";

import React from "react";
import Image from "next/image";
import { Play, Coins, TrendingUp, Shield, Zap, Globe, Users, Film, Star } from "lucide-react";

const stats = [
  { label: "Creators", value: "10K+", icon: <Users className="w-5 h-5" /> },
  { label: "Videos Published", value: "50K+", icon: <Film className="w-5 h-5" /> },
  { label: "Total Earned", value: "$2M+", icon: <Coins className="w-5 h-5" /> },
  { label: "Countries", value: "80+", icon: <Globe className="w-5 h-5" /> },
];

const values = [
  {
    icon: <Shield className="w-6 h-6 text-brand-pixsee-secondary" />,
    title: "Creator-First",
    description:
      "We believe creators deserve to own their content and their revenue. Every feature we build starts with: does this help creators earn more?",
  },
  {
    icon: <Zap className="w-6 h-6 text-brand-pixsee-secondary" />,
    title: "Transparent Economics",
    description:
      "Bonding curves, TIX tokens, and on-chain episode access — no black-box algorithms, no opaque revenue splits. You see exactly what you earn.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-brand-pixsee-secondary" />,
    title: "Aligned Incentives",
    description:
      "When viewers watch and engage, creators earn. When creators thrive, the platform grows. Our tokenomics are designed so everyone wins together.",
  },
  {
    icon: <Star className="w-6 h-6 text-brand-pixsee-secondary" />,
    title: "Quality Content",
    description:
      "We curate for quality over quantity. A show's value is reflected in its token price — the market rewards great storytelling.",
  },
];

const team = [
  {
    name: "Thomas Ross",
    role: "Co-founder & CEO",
    bio: "Veteran media producer turned Web3 builder. Spent 10 years frustrated by how little creators earned from their work.",
    initials: "T",
    image: "/images/tom.png",
  },
  {
    name: "John Doe",
    role: "Co-founder & CTO",
    bio: "Smart contract engineer with a background in DeFi protocols. Designed the bonding curve and TIX token mechanics.",
    initials: "J",
    image: "/images/communityimg3.png",
  },
  {
    name: "Pixsee Team",
    role: "Engineering & Design",
    bio: "A distributed team of engineers, designers, and crypto-natives building the future of video monetization.",
    initials: "P",
    image: "/images/community_1.png",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Creator uploads a show",
    description:
      "Upload your video, set episode pricing, and publish. A smart contract is deployed on Base, giving each show its own on-chain identity.",
  },
  {
    step: "02",
    title: "Show gets its own TIX token",
    description:
      "Every show has a unique TIX token on a bonding curve. Early supporters buy in cheap. As demand grows, the token price rises.",
  },
  {
    step: "03",
    title: "Viewers pay per minute",
    description:
      "Viewers unlock episodes by spending USDC or their TIX balance. Revenue flows directly to creators — no middleman.",
  },
  {
    step: "04",
    title: "Creators and holders earn",
    description:
      "A portion of every unlock goes to the creator. TIX holders also earn from trading activity — aligned incentives for everyone.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-foundation-alternate">
      {/* Hero */}
      <section className="relative overflow-hidden bg-neutral-primary border-b border-neutral-tertiary-border">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-pixsee-secondary/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pixsee-secondary/10 text-brand-pixsee-secondary text-sm font-medium mb-6">
              <Play className="w-3.5 h-3.5 fill-current" />
              The Creator Economy, On-Chain
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-paytone text-neutral-primary-text leading-tight mb-6">
              We built Pixsee for creators who deserve more.
            </h1>
            <p className="text-lg sm:text-xl text-neutral-secondary-text leading-relaxed">
              Pixsee is a decentralized video platform where creators own their content,
              set their own prices, and earn directly from their audience — no algorithm
              gatekeeping, no revenue share with a corporation.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-pixsee-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="flex items-center justify-center gap-2 text-white/70 mb-1">
                  {s.icon}
                  <span className="text-sm">{s.label}</span>
                </div>
                <p className="text-3xl sm:text-4xl font-paytone text-white">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-paytone text-neutral-primary-text mb-5">
              Our Mission
            </h2>
            <p className="text-neutral-secondary-text leading-relaxed mb-4">
              The video industry has a creator problem. Platforms take 30–55% of revenue,
              algorithms decide who gets seen, and creators have no ownership over the
              audiences they build.
            </p>
            <p className="text-neutral-secondary-text leading-relaxed mb-4">
              We started Pixsee to flip this model. Every show on Pixsee is backed by
              a smart contract. Every episode unlock is a transaction on Base. Revenue
              goes directly from viewer to creator — we take a small protocol fee, nothing more.
            </p>
            <p className="text-neutral-secondary-text leading-relaxed">
              This isn't just a streaming platform. It's a new economic model for
              storytellers.
            </p>
          </div>
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-secondary border border-neutral-tertiary-border flex items-center justify-center">
            <div className="text-center px-8">
              <Play className="w-16 h-16 text-brand-pixsee-secondary mx-auto mb-4 fill-brand-pixsee-secondary/20" />
              <p className="text-neutral-secondary-text text-sm">
                Watch our story — coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-primary border-y border-neutral-tertiary-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h2 className="text-3xl sm:text-4xl font-paytone text-neutral-primary-text mb-12 text-center">
            How Pixsee Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="flex gap-5 p-6 rounded-2xl bg-neutral-secondary border border-neutral-tertiary-border"
              >
                <span className="text-4xl font-paytone text-brand-pixsee-secondary/30 leading-none shrink-0">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-primary-text mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-secondary-text leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <h2 className="text-3xl sm:text-4xl font-paytone text-neutral-primary-text mb-4 text-center">
          What We Stand For
        </h2>
        <p className="text-neutral-secondary-text text-center mb-12 max-w-xl mx-auto">
          These aren't just words on a wall — they're the constraints we design within.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="p-6 rounded-2xl bg-neutral-primary border border-neutral-tertiary-border hover:border-brand-pixsee-secondary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-pixsee-secondary/10 flex items-center justify-center mb-4">
                {v.icon}
              </div>
              <h3 className="font-semibold text-neutral-primary-text mb-2">{v.title}</h3>
              <p className="text-sm text-neutral-secondary-text leading-relaxed">
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-neutral-primary border-t border-neutral-tertiary-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h2 className="text-3xl sm:text-4xl font-paytone text-neutral-primary-text mb-12 text-center">
            The Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="group relative rounded-2xl overflow-hidden aspect-3/4 cursor-default"
              >
                {/* Background image */}
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Base dark gradient — always visible at bottom for minimal identity */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                {/* Hover overlay — darkens the whole card */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

                {/* Initials avatar — visible by default, fades out on hover */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                  <div className="w-14 h-14 rounded-full bg-brand-pixsee-secondary flex items-center justify-center text-white text-xl font-paytone shadow-lg">
                    {member.initials}
                  </div>
                  <span className="text-white font-semibold text-sm">{member.name}</span>
                </div>

                {/* Text content — hidden by default, slides up on hover */}
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out text-center">
                  <h3 className="font-semibold text-white text-lg mb-1">{member.name}</h3>
                  <p className="text-xs text-brand-pixsee-secondary font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-white/80 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-paytone text-neutral-primary-text mb-4">
          Ready to create or collect?
        </h2>
        <p className="text-neutral-secondary-text mb-8 max-w-md mx-auto">
          Join thousands of creators and collectors building the next generation of entertainment.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/dashboard/create"
            className="px-8 py-3 rounded-full bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white font-medium transition-colors"
          >
            Start Creating
          </a>
          <a
            href="/dashboard/watch"
            className="px-8 py-3 rounded-full border border-neutral-tertiary-border text-neutral-secondary-text hover:text-neutral-primary-text hover:border-neutral-primary-text transition-colors font-medium"
          >
            Browse Shows
          </a>
        </div>
      </section>
    </div>
  );
}
