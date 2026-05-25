"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSocialState } from "@/app/context/SocialStateContext";
import { apiFetch } from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";
type GetAccessToken = () => Promise<string | null>;

// ─── Types ────────────────────────────────────────────────────────────────────

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

export type ApiTransaction = {
  id: number;
  type: string;
  amount: string;
  currency?: "USDC" | "TIX";
  label?: string;
  description?: string;
  created_at: string;
  ledger_type?: string;
  metadata?: Record<string, unknown>;
};

export type ApiNotification = {
  id: string;
  type:
    | "video_liked"
    | "comment_posted"
    | "comment_replied"
    | "user_followed"
    | "royalties_claimed"
    | "tix_bought"
    | "tix_sold"
    | "tix_bought_for_show"
    | "watch_cashback"
    | "show_created"
    | "show_updated"
    | "show_deleted"
    | "show_published"
    | "show_approved"
    | "show_rejected"
    | "creator_fee_claimed";
  data: Record<string, any>;
  read: boolean;
  read_at: string | null;
  created_at: string;
};

export type WatchlistItem = {
  id: number;
  type: "show" | "video";
  show?: any;
  video?: any;
  saved_at: string;
};

export type EarnData = {
  see_points_balance: number;
  watch_points?: number;
  engagement_points?: number;
  referral_points?: number;
  comment_points?: number;
  like_points?: number;
};

// ─── Likes ────────────────────────────────────────────────────────────────────
// Zustand-backed for persistence across navigations. useMutation handles the API.

export function useLike(
  videoId: number | null,
  getAccessToken: GetAccessToken,
  initialLiked = false,
  initialCount = 0
) {
  const store = useSocialState();
  const [loading, setLoading] = useState(false);

  const liked = videoId != null ? (store.liked[videoId] ?? initialLiked) : initialLiked;
  const likesCount = videoId != null ? (store.likeCount[videoId] ?? initialCount) : initialCount;

  const setLikesCount = useCallback(
    (v: number) => { if (videoId != null) store.setLikeCount(videoId, v); },
    [videoId, store]
  );

  const toggle = useCallback(async () => {
    if (!videoId || loading) return;
    setLoading(true);
    const wasLiked = liked;
    const wasCount = likesCount;

    // Optimistic update in Zustand (persists across navigations)
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

// ─── Comments ─────────────────────────────────────────────────────────────────

export function useComments(
  videoId: number | null,
  getAccessToken: GetAccessToken,
  sort: "top" | "recents" | "following" = "recents"
) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.social.comments(videoId!, sort);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getAccessToken();
      const sortParam = sort === "recents" ? "-created_at" : sort === "top" ? "-likes_count" : "-created_at";
      const json = await apiFetch<{ data?: ApiComment[] }>(
        `/api/v1/videos/${videoId}/comments?per_page=50&sort=${sortParam}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return json.data ?? [];
    },
    enabled: videoId != null,
    staleTime: 30 * 1000,
  });

  const postMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: number }) => {
      const token = await getAccessToken();
      await apiFetch(`/api/v1/videos/${videoId}/comments`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ body: content.trim(), ...(parentId ? { parent_id: parentId } : {}) }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const token = await getAccessToken();
      await apiFetch(`/api/v1/videos/${videoId}/comments/${commentId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    onSuccess: (_data, commentId) => {
      // Optimistic removal from cache
      queryClient.setQueryData<ApiComment[]>(queryKey, (old) =>
        old ? old.filter((c) => c.id !== commentId) : []
      );
    },
  });

  const postComment = async (content: string, parentId?: number): Promise<boolean> => {
    if (!videoId || !content.trim()) return false;
    try {
      await postMutation.mutateAsync({ content, parentId });
      return true;
    } catch {
      return false;
    }
  };

  const deleteComment = async (commentId: number): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(commentId);
      return true;
    } catch {
      return false;
    }
  };

  return {
    comments: query.data ?? [],
    isLoading: query.isLoading,
    isPosting: postMutation.isPending,
    error: query.error ? String(query.error) : null,
    postComment,
    deleteComment,
    refetch: query.refetch,
  };
}

// ─── Follow ───────────────────────────────────────────────────────────────────
// Zustand-backed for persistence. API call via useMutation.

export function useFollow(
  creatorId: number | null | undefined,
  getAccessToken: GetAccessToken,
  initialFollowing = false
) {
  const cache = useSocialState();
  const [loading, setLoading] = useState(false);

  const getCached = () => (creatorId != null ? cache.getFollowing(creatorId) : undefined);
  const following = getCached() ?? initialFollowing;

  const setFollowing = useCallback(
    (v: boolean) => {
      if (creatorId != null) cache.setFollowing(creatorId, v);
    },
    [creatorId, cache]
  );

  // Fetch follow status from API only when not already in the Zustand cache
  useQuery({
    queryKey: ["follow-status", creatorId],
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return null;
      const json = await apiFetch<any>(`/api/v1/users/${creatorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const isFollowing =
        json?.following ??
        json?.is_following ??
        json?.data?.is_following ??
        json?.data?.following;
      if (isFollowing != null) setFollowing(Boolean(isFollowing));
      return isFollowing;
    },
    enabled: creatorId != null && getCached() === undefined,
    staleTime: 5 * 60 * 1000,
  });

  const toggle = useCallback(async () => {
    if (!creatorId || loading) return;
    setLoading(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing); // optimistic
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/v1/users/${creatorId}/follow`, {
        method: wasFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json().catch(() => null);
        const confirmed =
          json?.following ?? json?.is_following ?? json?.data?.is_following ?? !wasFollowing;
        setFollowing(Boolean(confirmed));
      } else {
        setFollowing(wasFollowing);
      }
    } catch {
      setFollowing(wasFollowing);
    } finally {
      setLoading(false);
    }
  }, [creatorId, following, loading, getAccessToken, setFollowing]);

  return { following, loading, toggle };
}

// ─── Me (profile) ─────────────────────────────────────────────────────────────

export function useMe(getAccessToken: GetAccessToken) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return null;
      const json = await apiFetch<{ data?: ApiProfile } | ApiProfile>("/api/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return ((json as any)?.data ?? json) as ApiProfile;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<ApiProfile, "name" | "username" | "bio">>) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return apiFetch<{ data?: ApiProfile } | ApiProfile>("/api/v1/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (json) => {
      const updated = ((json as any)?.data ?? json) as ApiProfile;
      queryClient.setQueryData(queryKeys.profile.me(), updated);
    },
  });

  const updateProfile = async (
    updates: Partial<Pick<ApiProfile, "name" | "username" | "bio">>
  ): Promise<boolean> => {
    await updateMutation.mutateAsync(updates);
    return true;
  };

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    updateProfile,
  };
}

// ─── Watch History ────────────────────────────────────────────────────────────

export function useWatchHistory(getAccessToken: GetAccessToken) {
  const query = useQuery({
    queryKey: queryKeys.social.watchHistory(),
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return [];
      const json = await apiFetch<{ data?: any[] }>("/api/v1/me/watch-history?per_page=20", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return json.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return { history: query.data ?? [], isLoading: query.isLoading };
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function useTransactions(getAccessToken: GetAccessToken) {
  const query = useQuery({
    queryKey: queryKeys.social.transactions(),
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return [];
      const json = await apiFetch<{ data?: ApiTransaction[] }>(
        "/api/v1/me/transactions?per_page=100",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return json.data ?? [];
    },
    staleTime: 60 * 1000,
  });

  return {
    transactions: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

// ─── Royalty Schedule ─────────────────────────────────────────────────────────

export type RoyaltySchedule = "daily" | "weekly" | "manual";

export function useRoyaltySchedule(getAccessToken: GetAccessToken) {
  const queryClient = useQueryClient();
  const queryKey = ["royaltySchedule"] as const;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return "manual" as RoyaltySchedule;
      const json = await apiFetch<{ schedule: RoyaltySchedule }>("/api/v1/me/royalty-schedule", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return json.schedule ?? "manual";
    },
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async (schedule: RoyaltySchedule) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return apiFetch<{ schedule: RoyaltySchedule }>("/api/v1/me/royalty-schedule", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data.schedule);
    },
  });

  return {
    schedule: query.data ?? "manual",
    isLoading: query.isLoading,
    update: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  };
}

// ─── Transaction Analytics ────────────────────────────────────────────────────

export type TransactionAnalytics = {
  total_royalties_claimed_usdc: string;
  royalties_claims_count: number;
  total_box_office_revenue_usdc: string;
  fee_claims_count: number;
  shows_count?: number;
};

export function useTransactionAnalytics(getAccessToken: GetAccessToken) {
  const query = useQuery({
    queryKey: queryKeys.social.transactionAnalytics(),
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return null;
      return apiFetch<TransactionAnalytics>("/api/v1/me/transaction-analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    staleTime: 2 * 60 * 1000,
  });
  return { analytics: query.data ?? null, isLoading: query.isLoading };
}

// ─── Notifications ────────────────────────────────────────────────────────────

export function useNotifications(getAccessToken: GetAccessToken) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.social.notifications();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return { notifications: [], unreadCount: 0 };
      const [nRes, cRes] = await Promise.all([
        apiFetch<{ data?: ApiNotification[] }>("/api/v1/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: [] as ApiNotification[] })),
        apiFetch<{ count?: number; unread_count?: number }>("/api/v1/notifications/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ count: 0 })),
      ]);
      return {
        notifications: nRes.data ?? [],
        unreadCount: cRes.count ?? (cRes as any).unread_count ?? 0,
      };
    },
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Poll every 30s for new notifications
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const token = await getAccessToken();
      if (!token) return;
      await apiFetch("/api/v1/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, (old: any) =>
        old
          ? {
              ...old,
              unreadCount: 0,
              notifications: old.notifications.map((n: ApiNotification) => ({ ...n, read: true })),
            }
          : old
      );
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = await getAccessToken();
      if (!token) return;
      await apiFetch(`/api/v1/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData(queryKey, (old: any) =>
        old
          ? {
              ...old,
              unreadCount: Math.max(0, old.unreadCount - 1),
              notifications: old.notifications.map((n: ApiNotification) =>
                n.id === id ? { ...n, read: true } : n
              ),
            }
          : old
      );
    },
  });

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markAllRead: () => markAllReadMutation.mutate(),
    markRead: (id: string) => markReadMutation.mutate(id),
    refetch: query.refetch,
  };
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export function useWatchlist(getAccessToken: GetAccessToken) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.social.watchlist();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return [];
      const json = await apiFetch<{ data?: WatchlistItem[] }>("/api/v1/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return json.data ?? [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async (showId: number) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await apiFetch(`/api/v1/watchlist/shows/${showId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const removeMutation = useMutation({
    mutationFn: async (showId: number) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      await apiFetch(`/api/v1/watchlist/shows/${showId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (_data, showId) => {
      queryClient.setQueryData<WatchlistItem[]>(queryKey, (old) =>
        old ? old.filter((i) => i.show?.id !== showId) : []
      );
    },
  });

  const addShow = async (showId: number): Promise<boolean> => {
    try { await addMutation.mutateAsync(showId); return true; } catch { return false; }
  };

  const removeShow = async (showId: number): Promise<boolean> => {
    try { await removeMutation.mutateAsync(showId); return true; } catch { return false; }
  };

  const isInWatchlist = useCallback(
    (showId: number) => (query.data ?? []).some((i) => i.type === "show" && i.show?.id === showId),
    [query.data]
  );

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    addShow,
    removeShow,
    isInWatchlist,
    refetch: query.refetch,
  };
}

// ─── SEE Points (Earn) ────────────────────────────────────────────────────────

export function useSeePoints(getAccessToken: GetAccessToken) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.social.seePoints();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const token = await getAccessToken();
      if (!token) return null;
      return apiFetch<EarnData>("/api/v1/earn", {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    staleTime: 60 * 1000,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not authenticated");
      return apiFetch<EarnData>("/api/v1/earn/claim", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (json) => queryClient.setQueryData(queryKey, json),
  });

  const claim = async () => {
    try { return await claimMutation.mutateAsync(); } catch { return null; }
  };

  return {
    balance: query.data?.see_points_balance ?? null,
    earnData: query.data ?? null,
    isLoading: query.isLoading,
    claim,
  };
}
