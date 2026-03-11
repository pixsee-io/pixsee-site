"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Diamond, Gem } from "lucide-react";

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
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-4 border border-neutral-tertiary-border text-center">
        <p className="text-sm sm:text-base text-neutral-secondary-text">
          You Are on NO{" "}
          <span className="font-bold text-neutral-primary-text">
            {userRank.position}
          </span>{" "}
          on the leaderboard of{" "}
          <span className="font-bold text-neutral-primary-text">
            {userRank.totalUsers.toLocaleString()} users
          </span>
          <span className="inline-flex items-center gap-1 ml-2">
            <Gem className="w-4 h-4 text-brand-pixsee-secondary" />
            <span className="font-bold text-brand-pixsee-secondary">
              {userRank.points}
            </span>
          </span>
        </p>
      </div>

      {/* Top Rankers Podium */}
      <section>
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-10 md:mb-6">
          Top Rankers
        </h2>

        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-9 md:gap-4">
          {topRankers.map((ranker) => (
            <div key={ranker.id} className="flex flex-col items-center flex-1 ">
              <div className="relative w-full">
                <Image
                  src={ranker.podiumImage}
                  alt={`Podium position ${ranker.position}`}
                  width={460}
                  height={250}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-start pb-2 sm:pb-4">
                  <div className="-mt-6 sm:-mt-8 md:-mt-12 mb-1 sm:mb-2 md:mb-4">
                    <div className="p-1 rounded-full flex items-center justify-center overflow-hidden">
                      <Image
                        src={"/images/guillermo.png"}
                        alt={ranker.name}
                        width={110}
                        height={110}
                        className="w-22 h-22 md:w-20 md:h-20 lg:w-25 lg:h-25 rounded-full object-cover"
                      />
                    </div>
                    <p className="text-white font-semibold text-center text-base mb-1 sm:mb-2 leading-tight px-1 truncate">
                      {ranker.name}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-yellow-400 flex items-center justify-center mb-1 sm:mb-2">
                    <Trophy className="w-5 h-5 text-yellow-800" />
                  </div>
                  <p className="text-white/80 text-xs md:text-sm text-center px-1">
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-120">
              <thead>
                <tr className="bg-neutral-secondary text-xs sm:text-sm font-medium text-brand-pixsee-secondary">
                  <th className="text-left px-4 sm:px-6 py-3 font-medium w-16">
                    Rank
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 font-medium">
                    User name
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 font-medium">
                    Followers
                  </th>
                  <th className="text-right px-4 sm:px-6 py-3 font-medium">
                    Point
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-tertiary-border">
                {fullRanking.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => onUserClick(user)}
                    className="hover:bg-neutral-secondary cursor-pointer transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm text-neutral-primary-text">
                      {user.rank}
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden shrink-0">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-neutral-primary-text whitespace-nowrap">
                            {user.name}
                          </p>
                          <p className="text-xs text-neutral-tertiary-text whitespace-nowrap">
                            {user.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-neutral-secondary-text whitespace-nowrap">
                      {user.followers}
                    </td>

                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-sm font-medium text-neutral-primary-text whitespace-nowrap">
                      {user.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LeaderboardTab;
