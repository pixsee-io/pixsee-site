"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Diamond } from "lucide-react";

type TopRanker = {
  id: string;
  name: string;
  avatarUrl: string;
  podiumImage: string;
  points: string;
  position: 1 | 2 | 3;
};

type RankingUser = {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatarUrl: string;
  followers: string;
  points: string;
};

// Mock Data
const userRank = {
  position: 2,
  totalUsers: 23141,
  points: 2000,
};

const topRankers: TopRanker[] = [
  {
    id: "1",
    name: "Henrietta O'Connell",
    avatarUrl: "/images/avatars/avatar-1.jpg",
    points: "2,000 points",
    position: 1,
    podiumImage: "/images/podium1.png",
  },
  {
    id: "2",
    name: "Jolie Joie",
    avatarUrl: "/images/avatars/avatar-2.jpg",
    points: "2,000 points",
    position: 2,
    podiumImage: "/images/podium2.png",
  },
  {
    id: "3",
    name: "Joie",
    avatarUrl: "/images/avatars/avatar-3.jpg",
    points: "2,000 points",
    position: 3,
    podiumImage: "/images/podium3.png",
  },
];

const fullRanking: RankingUser[] = [
  {
    id: "4",
    rank: 4,
    name: "Henrietta O'Connell",
    username: "@henrietta",
    avatarUrl: "/images/avatars/avatar-1.jpg",
    followers: "12,241",
    points: "2,114,424",
  },
  {
    id: "5",
    rank: 5,
    name: "Darrel Bins",
    username: "@darrel",
    avatarUrl: "/images/avatars/avatar-2.jpg",
    followers: "12,241",
    points: "2,114,424",
  },
  {
    id: "6",
    rank: 6,
    name: "Sally Kovacek",
    username: "@S1xoahjZN1soYdC",
    avatarUrl: "/images/avatars/avatar-3.jpg",
    followers: "12,241",
    points: "2,114,424",
  },
  {
    id: "7",
    rank: 7,
    name: "Jose Gulgowski",
    username: "@c6axRR8zNeqsb6G",
    avatarUrl: "/images/avatars/avatar-1.jpg",
    followers: "12,241",
    points: "2,114,424",
  },
  {
    id: "8",
    rank: 8,
    name: "Ada Leannon",
    username: "@T9rKwtVJ3rawKn_",
    avatarUrl: "/images/avatars/avatar-2.jpg",
    followers: "12,241",
    points: "2,114,424",
  },
  {
    id: "9",
    rank: 9,
    name: "Mona Bechtelar III",
    username: "@Y1BVJw09OLICRDq",
    avatarUrl: "/images/avatars/avatar-3.jpg",
    followers: "12,241",
    points: "2,114,424",
  },
  {
    id: "10",
    rank: 10,
    name: "Elmer Rau",
    username: "@0jlRhxwSES2oOKl",
    avatarUrl: "/images/avatars/avatar-1.jpg",
    followers: "12,241",
    points: "2,114,424",
  },
  {
    id: "11",
    rank: 11,
    name: "Terrence Sipes",
    username: "@bezpVnNulRFR3zO",
    avatarUrl: "/images/avatars/avatar-2.jpg",
    followers: "12,241",
    points: "2,114,424",
  },
];

type LeaderboardTabProps = {
  onUserClick: (user: RankingUser) => void;
};

const LeaderboardTab = ({ onUserClick }: LeaderboardTabProps) => {
  // Podium colors
  const podiumColors = {
    1: "bg-gradient-to-b from-purple-600 to-purple-800",
    2: "bg-gradient-to-b from-blue-400 to-blue-600",
    3: "bg-gradient-to-b from-pink-400 to-pink-600",
  };

  const podiumHeights = {
    1: "h-44",
    2: "h-36",
    3: "h-28",
  };

  return (
    <div className="space-y-8">
      {/* User Rank Banner */}
      <div className="bg-white rounded-xl p-4 border border-neutral-tertiary-border text-center">
        <p className="text-neutral-secondary-text">
          You Are on NO{" "}
          <span className="font-bold text-neutral-primary-text">
            {userRank.position}
          </span>{" "}
          on the leaderboard of{" "}
          <span className="font-bold text-neutral-primary-text">
            {userRank.totalUsers.toLocaleString()} users
          </span>
          <span className="inline-flex items-center gap-1 ml-2">
            <Diamond className="w-4 h-4 text-brand-pixsee-secondary" />
            <span className="font-bold text-brand-pixsee-secondary">
              {userRank.points}
            </span>
          </span>
        </p>
      </div>

      {/* Top Rankers Podium */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
          Top Rankers
        </h2>
        <div className="flex items-end justify-center gap-4">
          {topRankers.map((ranker) => (
            <div key={ranker.id} className="flex flex-col items-center">
              {/* Podium */}
              <div className="relative">
                <Image
                  src={ranker.podiumImage}
                  alt="podium1"
                  width={460}
                  height={250}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-start pb-4">
                  <div className="md:-mt-12 mb-4">
                    <div className="p-2 rounded-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={"/images/guillermo.png"}
                        alt="podium1"
                        width={110}
                        height={110}
                      />
                    </div>

                    <p className="text-white font-semibold text-center text-sm md:text-base mb-2">
                      {ranker.name}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5 text-yellow-800" />
                  </div>
                  <p className="text-white/80 text-xs md:text-sm">
                    Earn {ranker.points}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full Ranking Table */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-4">
          Full Ranking
        </h2>
        <div className="bg-white rounded-xl border border-neutral-tertiary-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-neutral-secondary text-sm font-medium text-brand-pixsee-secondary">
            <span>Rank</span>
            <span>User name</span>
            <span>Followers</span>
            <span className="text-right">Point</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-neutral-tertiary-border">
            {fullRanking.map((user) => (
              <div
                key={user.id}
                onClick={() => onUserClick(user)}
                className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-neutral-secondary cursor-pointer transition-colors"
              >
                <span className="font-medium text-neutral-primary-text">
                  {user.rank}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden">
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-primary-text">
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-tertiary-text">
                      {user.username}
                    </p>
                  </div>
                </div>
                <span className="text-neutral-secondary-text">
                  {user.followers}
                </span>
                <span className="text-right font-medium text-neutral-primary-text">
                  {user.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LeaderboardTab;
