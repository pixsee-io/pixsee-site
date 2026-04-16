export type ApiEpisode = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  tags?: string[];
  show_id: number;
  season_number: number;
  episode_number: number;
  on_chain_episode_id?: string | null;
  mux_status: "waiting" | "preparing" | "ready" | "errored";
  mux_playback_id?: string | null;
  duration?: number | null;
  thumbnail_url?: string | null;
  is_free: boolean;
  token_price?: string;
  requires_payment?: boolean;
  view_count?: number;
  unique_viewers?: number;
  status?: string;
  published_at?: string | null;
  creator?: {
    id: number;
    name?: string;
    username?: string;
    avatar_url?: string;
    wallet_address?: string | null;
    type?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
};

export type ApiSeason = {
  season_number: number;
  episode_count: number;
  episodes: ApiEpisode[];
};

export type ApiShow = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  tags?: string[];
  type: "movie" | "tv_show" | "reel" | "short";
  cover_image_url?: string | null;
  on_chain_show_id?: string | null;
  show_contract?: string | null;
  bonding_curve?: string | null;
  tix_token?: string | null;
  fee_distributor?: string | null;
  status?: string;
  published_at?: string | null;
  category?: { id: number; name: string } | null;
  creator?: {
    id: number;
    name?: string;
    username?: string;
    avatar_url?: string;
    wallet_address?: string | null;
  } | null;
  episodes?: ApiEpisode[];
  seasons?: ApiSeason[];
  created_at?: string;
  updated_at?: string;
};

export type ApiPaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type ApiMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  links: { url: string | null; label: string; active: boolean }[];
  per_page: number;
  to: number | null;
  total: number;
};

export type ApiShowsResponse = {
  data: ApiShow[];
  links: ApiPaginationLinks;
  meta: ApiMeta;
};

export type ApiShowResponse = {
  data: ApiShow;
};

// Legacy video types kept for /my-videos polling compatibility
export type ApiVideo = ApiEpisode & {
  cover_url?: string | null;
  cover_image_url?: string | null;
  likes_count?: number;
  views_count?: number;
  user?: {
    id: number;
    name?: string;
    username?: string;
    avatar_url?: string;
    profile_image_url?: string;
  } | null;
};

export type ApiVideosResponse = {
  data: ApiVideo[];
  links: ApiPaginationLinks;
  meta: ApiMeta;
};
