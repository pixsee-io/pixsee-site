import React from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SocialStore = {
  liked: Record<number, boolean>;
  likeCount: Record<number, number>;
  following: Record<number, boolean>;

  getLiked: (videoId: number) => boolean | undefined;
  setLiked: (videoId: number, v: boolean) => void;
  getLikeCount: (videoId: number) => number | undefined;
  setLikeCount: (videoId: number, v: number) => void;
  getFollowing: (userId: number) => boolean | undefined;
  setFollowing: (userId: number, v: boolean) => void;
};

const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      liked: {},
      likeCount: {},
      following: {},

      getLiked: (id) => get().liked[id],
      setLiked: (id, v) => set((s) => ({ liked: { ...s.liked, [id]: v } })),
      getLikeCount: (id) => get().likeCount[id],
      setLikeCount: (id, v) => set((s) => ({ likeCount: { ...s.likeCount, [id]: v } })),
      getFollowing: (id) => get().following[id],
      setFollowing: (id, v) => set((s) => ({ following: { ...s.following, [id]: v } })),
    }),
    {
      name: "pixsee-social",
      partialize: (s) => ({ liked: s.liked, likeCount: s.likeCount, following: s.following }),
    }
  )
);

export function useSocialState() {
  return useSocialStore();
}

export function SocialStateProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
