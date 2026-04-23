"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSocialState } from "@/app/context/SocialStateContext";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

type GetAccessToken = () => Promise<string | null>;

// ─── Types ───────────────────────────────────────────────────────────────────

export type ApiComment = {
  id: number;
  body: string;
  parent_id: number | null;
  created_at: string;
  user: {
    id: number;
    name?: string;
    username?: string;
    avatar_url?: string;
  };
  replies?: ApiComment[];
};

// ─── Likes ───────────────────────────────────────────────────────────────────

export function useLike(
  videoId: number | null,
  getAccessToken: GetAccessToken,
  initialLiked = false,
  initialCount = 0
) {
  const cache = useSocialState();

  // Seed from cache if available, otherwise use initial prop
  const [liked, setLikedState] = useState(() => {
    if (videoId != null) {
      const cached = cache.getLiked(videoId);
      if (cached !== undefined) return cached;
    }
    return initialLiked;
  });
  const [likesCount, setLikesCountState] = useState(() => {
    if (videoId != null) {
      const cached = cache.getLikeCount(videoId);
      if (cached !== undefined) return cached;
    }
    return initialCount;
  });
  const [loading, setLoading] = useState(false);

  const setLiked = useCallback((v: boolean) => {
    setLikedState(v);
    if (videoId != null) cache.setLiked(videoId, v);
  }, [videoId, cache]);

  const setLikesCount = useCallback((updater: number | ((prev: number) => number)) => {
    setLikesCountState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (videoId != null) cache.setLikeCount(videoId, next);
      return next;
    });
  }, [videoId, cache]);

  // Sync when switching episodes — prefer cache, fall back to props
  React.useEffect(() => {
    if (videoId == null) return;
    const cachedLiked = cache.getLiked(videoId);
    const cachedCount = cache.getLikeCount(videoId);
    setLikedState(cachedLiked !== undefined ? cachedLiked : initialLiked);
    setLikesCountState(cachedCount !== undefined ? cachedCount : initialCount);
  }, [videoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(async () => {
    if (!videoId || loading) return;
    setLoading(true);
    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setLikesCount((c) => (!wasLiked ? c + 1 : Math.max(0, c - 1)));
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/v1/videos/${videoId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const newLiked = json?.liked ?? !wasLiked;
        const newCount = json?.like_count ?? json?.likes_count;
        setLiked(newLiked);
        if (newCount != null) setLikesCount(newCount);
      } else {
        // Revert on failure
        setLiked(wasLiked);
        setLikesCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
      }
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLoading(false);
    }
  }, [videoId, liked, loading, getAccessToken, setLiked, setLikesCount]);

  return { liked, likesCount, setLikesCount, loading, toggle };
}

// ─── Comments ────────────────────────────────────────────────────────────────

export function useComments(
  videoId: number | null,
  getAccessToken: GetAccessToken,
  sort: "top" | "recents" | "following" = "recents"
) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!videoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const sortParam = sort === "recents" ? "-created_at" : sort === "top" ? "-likes_count" : "-created_at";
      const res = await fetch(
        `${BASE_URL}/api/v1/videos/${videoId}/comments?per_page=50&sort=${sortParam}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setComments(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [videoId, sort, getAccessToken]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const postComment = useCallback(
    async (content: string, parentId?: number): Promise<boolean> => {
      if (!videoId || !content.trim()) return false;
      setIsPosting(true);
      try {
        const token = await getAccessToken();
        const res = await fetch(
          `${BASE_URL}/api/v1/videos/${videoId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              body: content.trim(),
              ...(parentId ? { parent_id: parentId } : {}),
            }),
          }
        );
        if (!res.ok) return false;
        await fetchComments();
        return true;
      } catch {
        return false;
      } finally {
        setIsPosting(false);
      }
    },
    [videoId, fetchComments, getAccessToken]
  );

  const deleteComment = useCallback(
    async (commentId: number): Promise<boolean> => {
      if (!videoId) return false;
      try {
        const token = await getAccessToken();
        const res = await fetch(
          `${BASE_URL}/api/v1/videos/${videoId}/comments/${commentId}`,
          {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (res.ok) {
          setComments((prev) => prev.filter((c) => c.id !== commentId));
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [videoId, getAccessToken]
  );

  return {
    comments,
    isLoading,
    isPosting,
    error,
    postComment,
    deleteComment,
    refetch: fetchComments,
  };
}

// ─── Follow ──────────────────────────────────────────────────────────────────

export function useFollow(
  creatorId: number | null | undefined,
  getAccessToken: GetAccessToken,
  initialFollowing = false
) {
  const cache = useSocialState();

  const [following, setFollowingState] = useState(() => {
    if (creatorId != null) {
      const cached = cache.getFollowing(creatorId);
      if (cached !== undefined) return cached;
    }
    return initialFollowing;
  });
  const [loading, setLoading] = useState(false);

  const setFollowing = useCallback((v: boolean) => {
    setFollowingState(v);
    if (creatorId != null) cache.setFollowing(creatorId, v);
  }, [creatorId, cache]);

  // Fetch follow status from API only when not already cached
  useEffect(() => {
    if (!creatorId) return;
    // If we already have a cached value, update local state from it and skip fetch
    const cached = cache.getFollowing(creatorId);
    if (cached !== undefined) {
      setFollowingState(cached);
      return;
    }
    let cancelled = false;
    getAccessToken().then((token) => {
      if (!token || cancelled) return;
      fetch(`${BASE_URL}/api/v1/users/${creatorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.ok ? r.json() : null)
        .then((json) => {
          if (!json || cancelled) return;
          // Try all known response shapes
          const isFollowing =
            json?.following ??
            json?.is_following ??
            json?.data?.is_following ??
            json?.data?.following;
          if (isFollowing != null) {
            setFollowing(Boolean(isFollowing));
          }
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
  }, [creatorId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(async () => {
    if (!creatorId || loading) return;
    setLoading(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing); // optimistic
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${BASE_URL}/api/v1/users/${creatorId}/follow`,
        {
          method: wasFollowing ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (res.ok) {
        const json = await res.json().catch(() => null);
        // Confirm from server response if available
        const confirmed =
          json?.following ??
          json?.is_following ??
          json?.data?.is_following ??
          !wasFollowing;
        setFollowing(Boolean(confirmed));
      } else {
        setFollowing(wasFollowing); // revert on error
      }
    } catch {
      setFollowing(wasFollowing); // revert
    } finally {
      setLoading(false);
    }
  }, [creatorId, following, loading, getAccessToken, setFollowing]);

  return { following, loading, toggle };
}

// ─── Me (profile) ────────────────────────────────────────────────────────────

export type ApiProfile = {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  wallet_address?: string;
  token_balance?: string;
  followers_count?: number;
  following_count?: number;
  created_at?: string;
};

export function useMe(getAccessToken: GetAccessToken) {
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch(`${BASE_URL}/api/v1/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        if (!cancelled) setProfile(json.data ?? json);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetch_();
    return () => { cancelled = true; };
  }, [getAccessToken]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<ApiProfile, "name" | "username" | "bio">>) => {
      const token = await getAccessToken();
      if (!token) return false;
      const res = await fetch(`${BASE_URL}/api/v1/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const json = await res.json();
        setProfile(json.data ?? json);
        return true;
      }
      return false;
    },
    [getAccessToken]
  );

  return { profile, isLoading, error, updateProfile };
}

// ─── Watch History ────────────────────────────────────────────────────────────

export function useWatchHistory(getAccessToken: GetAccessToken) {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch(
          `${BASE_URL}/api/v1/me/watch-history?per_page=20`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setHistory(json.data ?? []);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetch_();
    return () => { cancelled = true; };
  }, [getAccessToken]);

  return { history, isLoading };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type ApiTransaction = {
  id: number;
  type: string;
  amount: string;
  description?: string;
  created_at: string;
};

export function useTransactions(getAccessToken: GetAccessToken) {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch(
          `${BASE_URL}/api/v1/me/transactions?per_page=20`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setTransactions(json.data ?? []);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetch_();
    return () => { cancelled = true; };
  }, [getAccessToken]);

  return { transactions, isLoading };
}
