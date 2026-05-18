import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";
type GetAccessToken = () => Promise<string | null>;

// ─── Studio show types ────────────────────────────────────────────────────────

export type StudioShow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  video_format?: "landscape" | "portrait" | null;
  cover_image_url: string | null;
  status: "draft" | "published";
  on_chain_show_id: string | null;
  episode_count?: number;
  view_count?: number;
  episodes?: { id: number; view_count: number; is_free: boolean }[];
  created_at: string;
  bonding_curve?: string | null;
  tix_token?: string | null;
  show_contract?: string | null;
  fee_distributor?: string | null;
};

// ─── useStudioShows ───────────────────────────────────────────────────────────

export function useStudioShows(getAccessToken: GetAccessToken) {
  const query = useQuery({
    queryKey: queryKeys.shows.studioList(),
    queryFn: async () => {
      const token = await getAccessToken().catch(() => null);
      const json = await apiFetch<{ data?: StudioShow[] }>("/api/v1/my-shows?per_page=50", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return (json?.data ?? json as unknown as StudioShow[] ?? []) as StudioShow[];
    },
    staleTime: 30 * 1000,
  });

  return {
    shows: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

// ─── useStudioShow (single) ───────────────────────────────────────────────────

export function useStudioShow(id: string | number, getAccessToken: GetAccessToken) {
  const query = useQuery({
    queryKey: queryKeys.shows.studioDetail(id),
    queryFn: async () => {
      const token = await getAccessToken();
      const json = await apiFetch<{ data?: StudioShow } | StudioShow>(
        `/api/v1/my-shows/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      return ((json as any)?.data ?? json) as StudioShow;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  return {
    show: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

// ─── useDeleteEpisode ─────────────────────────────────────────────────────────

export function useDeleteEpisode(getAccessToken: GetAccessToken) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ showId, videoId }: { showId: number; videoId: number }) => {
      const token = await getAccessToken();
      const res = await fetch(
        `${BASE_URL}/api/v1/my-shows/${showId}/episodes/${videoId}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? "Delete failed");
      }
    },
    onSuccess: (_data, { showId }) => {
      // Invalidate studio show cache so episode list refreshes
      queryClient.invalidateQueries({ queryKey: queryKeys.shows.studioDetail(showId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.shows.studioList() });
    },
  });

  // Preserve existing boolean-return API so callers don't need to change
  const deleteEpisode = async (showId: number, videoId: number): Promise<boolean> => {
    try {
      await mutation.mutateAsync({ showId, videoId });
      return true;
    } catch {
      return false;
    }
  };

  return {
    deleteEpisode,
    isDeleting: mutation.isPending,
    error: mutation.error ? String(mutation.error) : null,
  };
}
