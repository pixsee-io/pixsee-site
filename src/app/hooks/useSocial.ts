"use client";

import { useState, useEffect, useCallback } from "react";
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
  // Read directly from Zustand store — reactive, no local state copy needed.
  // When setLiked/setLikeCount are called anywhere, this component re-renders automatically.
  const store = useSocialState();
  const [loading, setLoading] = useState(false);

  // Derive from store; fall back to props if not in localStorage yet (first-ever visit)
  const liked = videoId != null ? (store.liked[videoId] ?? initialLiked) : initialLiked;
  const likesCount = videoId != null ? (store.likeCount[videoId] ?? initialCount) : initialCount;

  const setLikesCount = useCallback((v: number) => {
    if (videoId != null) store.setLikeCount(videoId, v);
  }, [videoId, store]);

  const toggle = useCallback(async () => {
    if (!videoId || loading) return;
    setLoading(true);
    const wasLiked = liked;
    const wasCount = likesCount;
    // Optimistic update directly in store
    store.setLiked(videoId, !wasLiked);
    store.setLikeCount(videoId, !wasLiked ? wasCount + 1 : Math.max(0, wasCount - 1));
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
        store.setLiked(videoId, json?.liked ?? !wasLiked);
        const newCount = json?.like_count ?? json?.likes_count;
        if (newCount != null) store.setLikeCount(videoId, newCount);
      } else {
        store.setLiked(videoId, wasLiked);
        store.setLikeCount(videoId, wasCount);
      }
    } catch {
      store.setLiked(videoId, wasLiked);
      store.setLikeCount(videoId, wasCount);
    } finally {
      setLoading(false);
    }
  }, [videoId, liked, likesCount, loading, getAccessToken, store]);

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

// ─── Notifications ────────────────────────────────────────────────────────────

export type ApiNotification = {
  id: string;
  type: "video_liked" | "comment_posted" | "comment_replied" | "user_followed";
  data: Record<string, any>;
  read: boolean;
  read_at: string | null;
  created_at: string;
};

export function useNotifications(getAccessToken: GetAccessToken) {
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;
    setIsLoading(true);
    try {
      const [nRes, cRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/v1/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (nRes.ok) {
        const json = await nRes.json();
        setNotifications(json.data ?? []);
      }
      if (cRes.ok) {
        const json = await cRes.json();
        setUnreadCount(json.count ?? json.unread_count ?? 0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const markAllRead = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;
    await fetch(`${BASE_URL}/api/v1/notifications/read-all`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [getAccessToken]);

  const markRead = useCallback(async (id: string) => {
    const token = await getAccessToken();
    if (!token) return;
    await fetch(`${BASE_URL}/api/v1/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, [getAccessToken]);

  return { notifications, unreadCount, isLoading, markAllRead, markRead, refetch: fetchAll };
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export type WatchlistItem = {
  id: number;
  type: "show" | "video";
  show?: any;
  video?: any;
  saved_at: string;
};

export function useWatchlist(getAccessToken: GetAccessToken) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchList = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/watchlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setItems(json.data ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const addShow = useCallback(async (showId: number) => {
    const token = await getAccessToken();
    if (!token) return false;
    const res = await fetch(`${BASE_URL}/api/v1/watchlist/shows/${showId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) fetchList();
    return res.ok;
  }, [getAccessToken, fetchList]);

  const removeShow = useCallback(async (showId: number) => {
    const token = await getAccessToken();
    if (!token) return false;
    const res = await fetch(`${BASE_URL}/api/v1/watchlist/shows/${showId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setItems((prev) => prev.filter((i) => i.show?.id !== showId));
    return res.ok;
  }, [getAccessToken]);

  const isInWatchlist = useCallback((showId: number) =>
    items.some((i) => i.type === "show" && i.show?.id === showId),
    [items]
  );

  return { items, isLoading, addShow, removeShow, isInWatchlist, refetch: fetchList };
}

// ─── SEE Points (Earn) ────────────────────────────────────────────────────────

export function useSeePoints(getAccessToken: GetAccessToken) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetch_() {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        if (!token) return;
        const res = await fetch(`${BASE_URL}/api/v1/earn`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setBalance(json.see_points_balance ?? 0);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetch_();
    return () => { cancelled = true; };
  }, [getAccessToken]);

  const claim = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) return null;
    const res = await fetch(`${BASE_URL}/api/v1/earn/claim`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    setBalance(json.see_points_balance ?? 0);
    return json;
  }, [getAccessToken]);

  return { balance, isLoading, claim };
}
