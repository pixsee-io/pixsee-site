export type ApiVideo = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  tags?: string[];
  mux_status: "waiting" | "preparing" | "ready" | "errored";
  mux_playback_id?: string | null;
  playback_url?: string | null;
  duration?: number;
  thumbnail_url?: string | null;
  cover_url?: string | null; // legacy alias
  is_free: boolean;
  token_price?: string;
  requires_payment?: boolean;
  view_count?: number;
  views_count?: number; // legacy alias
  likes_count?: number;
  unique_viewers?: number;
  status?: string;
  published_at?: string;
  category?: { id: number; name: string } | null;
  created_at?: string;
  updated_at?: string;
  creator?: {
    id: number;
    name?: string;
    username?: string;
    avatar_url?: string;
    profile_image_url?: string; // legacy alias
    wallet_address?: string | null;
    type?: string;
  } | null;
  user?: {
    id: number;
    name?: string;
    username?: string;
    avatar_url?: string;
    profile_image_url?: string; // legacy alias
  } | null;
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
  links: {
    url: string | null;
    label: string;
    page?: number | null;
    active: boolean;
  }[];
  per_page: number;
  to: number | null;
  total: number;
};

export type ApiVideosResponse = {
  data: ApiVideo[];
  links: ApiPaginationLinks;
  meta: ApiMeta;
};

export type ApiVideoResponse = {
  data: ApiVideo;
};
