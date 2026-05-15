/**
 * Centralized React Query key factory.
 * Using functions (not plain arrays) ensures keys are typed and co-located.
 */

export const queryKeys = {
  shows: {
    all: () => ["shows"] as const,
    list: (params: Record<string, unknown>) => ["shows", "list", params] as const,
    detail: (id: string | number) => ["shows", "detail", id] as const,
    mine: (perPage = 50) => ["shows", "mine", perPage] as const,
    studioList: () => ["shows", "studio"] as const,
    studioDetail: (id: string | number) => ["shows", "studio", id] as const,
  },
  profile: {
    me: () => ["profile", "me"] as const,
    user: (id: string | number) => ["profile", "user", id] as const,
    userShows: (id: string | number) => ["profile", "user", id, "shows"] as const,
  },
  social: {
    comments: (videoId: number, sort: string) =>
      ["social", "comments", videoId, sort] as const,
    notifications: () => ["social", "notifications"] as const,
    watchlist: () => ["social", "watchlist"] as const,
    watchHistory: () => ["social", "watchHistory"] as const,
    transactions: () => ["social", "transactions"] as const,
    seePoints: () => ["social", "seePoints"] as const,
  },
  portfolio: {
    tix: (walletAddress: string | undefined) =>
      ["portfolio", "tix", walletAddress] as const,
  },
  playback: {
    episode: (videoId: number | null, refreshKey?: number) =>
      ["playback", "episode", videoId, refreshKey ?? 0] as const,
  },
} as const;
