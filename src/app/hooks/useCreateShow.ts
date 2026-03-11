"use client";

import { useState, useRef, useCallback } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1_000;

type GetAccessToken = () => Promise<string | null>;

export type MuxStatus = "waiting" | "preparing" | "ready" | "errored";

export type EpisodeUploadState = {
  localId: string;
  title: string;
  description: string;
  file: File | null;
  apiVideoId: number | null;
  uploadUrl: string | null;
  muxStatus: MuxStatus | null;
  uploadProgress: number;
  error: string | null;
};

export type ShowMeta = {
  title: string;
  description: string;
  tags: string[];
  language: string;
  thumbnailFile: File | null;
};

type UseCreateShowReturn = {
  episodes: EpisodeUploadState[];
  isPublishing: boolean;
  publishError: string | null;
  attachFile: (localId: string, file: File) => void;
  initEpisodes: (
    localEpisodes: { id: string; title: string; description: string }[]
  ) => void;
  uploadAll: (meta: ShowMeta) => Promise<boolean>;
  pollUntilReady: (localId: string, knownVideoId?: number) => Promise<boolean>;
  publishAll: () => Promise<boolean>;
};

// ─── XHR upload with progress ──────────────────────────────────────────────

function uploadToMux(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Mux upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export function useCreateShow(
  getAccessToken: GetAccessToken
): UseCreateShowReturn {
  const [episodes, setEpisodes] = useState<EpisodeUploadState[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const pollTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;

  const updateEpisode = useCallback(
    (localId: string, patch: Partial<EpisodeUploadState>) => {
      setEpisodes((prev) =>
        prev.map((ep) => (ep.localId === localId ? { ...ep, ...patch } : ep))
      );
    },
    []
  );

  // Seed slots when user finishes details step
  const initEpisodes = useCallback(
    (localEpisodes: { id: string; title: string; description: string }[]) => {
      setEpisodes(
        localEpisodes.map((ep) => ({
          localId: ep.id,
          title: ep.title,
          description: ep.description,
          file: null,
          apiVideoId: null,
          uploadUrl: null,
          muxStatus: null,
          uploadProgress: 0,
          error: null,
        }))
      );
    },
    []
  );

  const attachFile = useCallback(
    (localId: string, file: File) =>
      updateEpisode(localId, { file, error: null, uploadProgress: 0 }),
    [updateEpisode]
  );

  // ── Upload flow: POST JSON → get upload_url → PUT to Mux ───────────────

  const uploadAll = useCallback(
    async (meta: ShowMeta): Promise<boolean> => {
      let currentEpisodes: EpisodeUploadState[] = [];
      setEpisodes((prev) => {
        currentEpisodes = prev;
        return prev;
      });
      await new Promise((r) => setTimeout(r, 0));

      const toUpload = currentEpisodes.filter((ep) => ep.file);
      if (toUpload.length === 0) return false;

      const results = await Promise.allSettled(
        toUpload.map(async (ep) => {
          // Fresh token per episode
          const token = await getTokenRef.current();

          // Step 1 — create video record, get upload_url
          const createRes = await fetch(`${BASE_URL}/api/v1/my-videos`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              title: ep.title || meta.title,
              description: ep.description || meta.description || "",
              is_free: true,
              ...(meta.tags.length > 0 ? { tags: meta.tags } : {}),
            }),
          });

          if (!createRes.ok) {
            const err = await createRes.json().catch(() => ({}));
            throw new Error(
              err?.message ?? `Create failed (${createRes.status})`
            );
          }

          const { video, upload_url } = await createRes.json();

          updateEpisode(ep.localId, {
            apiVideoId: video.id,
            uploadUrl: upload_url,
            muxStatus: "waiting",
            uploadProgress: 0,
          });

          // Step 2 — PUT binary directly to Mux (no auth header needed)
          await uploadToMux(upload_url, ep.file!, (pct) => {
            updateEpisode(ep.localId, { uploadProgress: pct });
          });

          updateEpisode(ep.localId, {
            uploadProgress: 100,
            muxStatus: "preparing",
          });

          // Start polling immediately with the known videoId — don't wait for state
          pollUntilReady(ep.localId, video.id);

          return video.id;
        })
      );

      results.forEach((result, i) => {
        if (result.status === "rejected") {
          updateEpisode(toUpload[i].localId, {
            error: result.reason?.message ?? "Upload failed",
          });
        }
      });

      return results.every((r) => r.status === "fulfilled");
    },
    [updateEpisode]
  );

  // ── Poll until mux_status === ready

  const pollUntilReady = useCallback(
    (localId: string, knownVideoId?: number): Promise<boolean> => {
      // Clear any existing poll for this episode
      if (pollTimers.current[localId]) {
        clearInterval(pollTimers.current[localId]);
        delete pollTimers.current[localId];
      }

      return new Promise((resolve) => {
        const startTime = Date.now();
        // Use passed-in id (available immediately after upload) or fall back to state
        const apiVideoId = knownVideoId ?? null;
        if (!apiVideoId) {
          resolve(false);
          return;
        }

        const tick = async () => {
          if (!apiVideoId) {
            resolve(false);
            return;
          }

          if (Date.now() - startTime > POLL_TIMEOUT_MS) {
            clearInterval(pollTimers.current[localId]);
            delete pollTimers.current[localId];
            updateEpisode(localId, { error: "Mux processing timed out" });
            resolve(false);
            return;
          }

          try {
            const token = await getTokenRef.current();
            const res = await fetch(
              `${BASE_URL}/api/v1/my-videos/${apiVideoId}`,
              { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            if (!res.ok) return; // transient — keep polling

            const data = await res.json();
            const muxStatus: MuxStatus =
              data?.data?.mux_status ?? data?.mux_status;
            updateEpisode(localId, { muxStatus });

            if (muxStatus === "ready" || muxStatus === "errored") {
              clearInterval(pollTimers.current[localId]);
              delete pollTimers.current[localId];
              resolve(muxStatus === "ready");
            }
          } catch {
            // transient network error — keep polling
          }
        };

        // Run immediately, then on interval
        tick();
        pollTimers.current[localId] = setInterval(tick, POLL_INTERVAL_MS);
      });
    },
    [updateEpisode]
  );

  // ── Publish

  const publishAll = useCallback(async (): Promise<boolean> => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      const results = await Promise.allSettled(
        episodes
          .filter((ep) => ep.apiVideoId && ep.muxStatus === "ready")
          .map(async (ep) => {
            const token = await getTokenRef.current();
            const res = await fetch(
              `${BASE_URL}/api/v1/my-videos/${ep.apiVideoId}/publish`,
              {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }
            );
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err?.message ?? `Publish failed (${res.status})`);
            }
          })
      );

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        setPublishError(`${failed.length} episode(s) failed to publish.`);
        return false;
      }
      return true;
    } finally {
      setIsPublishing(false);
    }
  }, [episodes]);

  return {
    episodes,
    isPublishing,
    publishError,
    attachFile,
    initEpisodes,
    uploadAll,
    pollUntilReady,
    publishAll,
  };
}
