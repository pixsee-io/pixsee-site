"use client";

import React, { createContext, useCallback, useContext, useRef } from "react";

// Global in-memory cache for social state that persists across navigation.
// Maps are keyed by ID (videoId for likes, userId for follows).

type SocialState = {
  // likes
  getLiked: (videoId: number) => boolean | undefined;
  setLiked: (videoId: number, liked: boolean) => void;
  getLikeCount: (videoId: number) => number | undefined;
  setLikeCount: (videoId: number, count: number) => void;
  // follows
  getFollowing: (userId: number) => boolean | undefined;
  setFollowing: (userId: number, following: boolean) => void;
};

const SocialStateContext = createContext<SocialState | null>(null);

export function SocialStateProvider({ children }: { children: React.ReactNode }) {
  // Use refs so mutations don't cause re-renders — subscribers manage their own state
  const likedMap = useRef<Map<number, boolean>>(new Map());
  const likeCountMap = useRef<Map<number, number>>(new Map());
  const followingMap = useRef<Map<number, boolean>>(new Map());

  const getLiked = useCallback((id: number) => likedMap.current.get(id), []);
  const setLiked = useCallback((id: number, v: boolean) => { likedMap.current.set(id, v); }, []);
  const getLikeCount = useCallback((id: number) => likeCountMap.current.get(id), []);
  const setLikeCount = useCallback((id: number, v: number) => { likeCountMap.current.set(id, v); }, []);
  const getFollowing = useCallback((id: number) => followingMap.current.get(id), []);
  const setFollowing = useCallback((id: number, v: boolean) => { followingMap.current.set(id, v); }, []);

  return (
    <SocialStateContext.Provider value={{ getLiked, setLiked, getLikeCount, setLikeCount, getFollowing, setFollowing }}>
      {children}
    </SocialStateContext.Provider>
  );
}

export function useSocialState() {
  const ctx = useContext(SocialStateContext);
  if (!ctx) throw new Error("useSocialState must be used within SocialStateProvider");
  return ctx;
}
