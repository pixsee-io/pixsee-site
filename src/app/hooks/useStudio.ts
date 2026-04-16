import { useState, useCallback } from "react";

type GetAccessToken = () => Promise<string | null>;

export function useDeleteEpisode(getAccessToken: GetAccessToken) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

  const deleteEpisode = useCallback(
    async (showId: number, videoId: number): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);
      try {
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
          setError(err?.message ?? "Delete failed");
          return false;
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [getAccessToken]
  );

  return { deleteEpisode, isDeleting, error };
}
