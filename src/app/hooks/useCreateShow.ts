"use client";

import { useState, useRef, useCallback } from "react";
import type { Address } from "viem";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";
const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 5 * 60 * 1_000;

type GetAccessToken = () => Promise<string | null>;

export type MuxStatus = "waiting" | "preparing" | "ready" | "errored";
export type ShowType = "movie" | "tv_show" | "reel" | "short";

export type EpisodeUploadState = {
  localId: string;
  title: string;
  description: string;
  file: File | null;
  apiVideoId: number | null;
  uploadUrl: string | null;
  muxStatus: MuxStatus | null;
  uploadProgress: number;
  durationSeconds: number | null; // populated after Mux processing completes
  error: string | null;
};

export type EpisodeMeta = {
  localId: string;
  title: string;
  description: string;
  isPaid: boolean;
};

export type ShowMeta = {
  title: string;
  description: string;
  tags: string[];
  language: string;
  thumbnailFile: File | null;
  showType: ShowType;
  videoFormat?: "landscape" | "portrait";
  episodesMeta?: EpisodeMeta[];
  tickSymbol?: string;
};

export type OnChainShowInfo = {
  onChainShowId: string;
  showContract: Address;
  bondingCurve: Address;
  tixToken: Address;
  feeDistributor: Address;
};

export type CreateOnChainShowFn = (params: {
  title: string;
  tickName: string;
  tickSymbol: string;
  creatorAddress: Address;
  curveTier?: 0 | 1 | 2;
}) => Promise<{
  showId: bigint;
  showInfo: {
    showContract: Address;
    bondingCurve: Address;
    tix: Address;
    feeDistributor: Address;
  };
} | null>;

// Injected from usePixseeContract — adds an episode to the on-chain ShowContract
export type AddEpisodeOnChainFn = (params: {
  showContractAddress: Address;
  durationSeconds: number;
  isFree: boolean;
}) => Promise<{ onChainEpisodeId: bigint } | null>;

type UseCreateShowOptions = {
  getAccessToken: GetAccessToken;
  walletAddress: Address | undefined;
  createOnChainShow: CreateOnChainShowFn;
  addEpisodeOnChain: AddEpisodeOnChainFn;
};

type UseCreateShowReturn = {
  episodes: EpisodeUploadState[];
  isPublishing: boolean;
  publishError: string | null;
  showId: number | null;
  onChainInfo: OnChainShowInfo | null;
  attachFile: (localId: string, file: File) => void;
  initEpisodes: (
    eps: { id: string; title: string; description: string }[]
  ) => void;
  addUploadSlot: (localId: string, title: string) => void;
  uploadAll: (meta: ShowMeta) => Promise<boolean>;
  uploadSingle: (localId: string, file: File, epMeta: { title: string; description: string }) => Promise<void>;
  syncEpisodesMeta: (episodesMeta: EpisodeMeta[]) => Promise<void>;
  pollUntilReady: (localId: string, knownVideoId?: number) => Promise<boolean>;
  publishAll: (meta: ShowMeta) => Promise<boolean>;
};

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
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Mux upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

function deriveTickName(title: string): string {
  return (
    title
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("")
      .slice(0, 12) + "Tix"
  );
}

function deriveTickSymbol(title: string): string {
  const initials = title
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
    .slice(0, 5);
  return initials || title.slice(0, 4).toUpperCase();
}

export function useCreateShow({
  getAccessToken,
  walletAddress,
  createOnChainShow,
  addEpisodeOnChain,
}: UseCreateShowOptions): UseCreateShowReturn {
  const [episodes, setEpisodes] = useState<EpisodeUploadState[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showId, setShowId] = useState<number | null>(null);
  const [onChainInfo, setOnChainInfo] = useState<OnChainShowInfo | null>(null);

  const pollTimers = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;
  const showIdRef = useRef<number | null>(null);

  const updateEpisode = useCallback(
    (localId: string, patch: Partial<EpisodeUploadState>) =>
      setEpisodes((prev) =>
        prev.map((ep) => (ep.localId === localId ? { ...ep, ...patch } : ep))
      ),
    []
  );

  const initEpisodes = useCallback(
    (localEpisodes: { id: string; title: string; description: string }[]) =>
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
          durationSeconds: null,
          error: null,
        }))
      ),
    []
  );

  const attachFile = useCallback(
    (localId: string, file: File) =>
      updateEpisode(localId, { file, error: null, uploadProgress: 0 }),
    [updateEpisode]
  );

  const addUploadSlot = useCallback((localId: string, title: string) => {
    setEpisodes((prev) => [
      ...prev,
      {
        localId,
        title,
        description: "",
        file: null,
        apiVideoId: null,
        uploadUrl: null,
        muxStatus: null,
        uploadProgress: 0,
        durationSeconds: null,
        error: null,
      },
    ]);
  }, []);

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

      const token = await getTokenRef.current();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const BATCH_SIZE = 10;
      const firstBatch = toUpload.slice(0, BATCH_SIZE);
      const remainingBatches: EpisodeUploadState[][] = [];
      for (let i = BATCH_SIZE; i < toUpload.length; i += BATCH_SIZE) {
        remainingBatches.push(toUpload.slice(i, i + BATCH_SIZE));
      }

      // NOTE: is_free is NOT sent here — pricing step hasn't happened yet.
      // is_free is correctly set in publishAll (Step 0) after the pricing step.
      const buildEpisodesPayload = (batch: EpisodeUploadState[]) =>
        batch.map((ep) => ({
          title: ep.title || meta.title,
          description: ep.description || "",
          is_free: true, // placeholder — overridden in publishAll Step 0
        }));

      // ── Step 1: Create show + first batch ──────────────────────────────────
      const showRes = await fetch(`${BASE_URL}/api/v1/my-shows`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: meta.title,
          description: meta.description,
          type: meta.showType,
          ...(meta.videoFormat ? { video_format: meta.videoFormat } : {}),
          ...(meta.tags.length > 0 ? { tags: meta.tags } : {}),
          ...(meta.tickSymbol?.trim() ? { tick_symbol: meta.tickSymbol.trim() } : {}),
          episodes: buildEpisodesPayload(firstBatch),
        }),
      });

      if (!showRes.ok) {
        const err = await showRes.json().catch(() => ({}));
        toUpload.forEach((ep) =>
          updateEpisode(ep.localId, {
            error: err?.message ?? `Show create failed (${showRes.status})`,
          })
        );
        return false;
      }

      const showJson = await showRes.json();
      const createdShowId: number =
        showJson?.show?.id ?? showJson?.data?.id ?? showJson?.id;
      setShowId(createdShowId);
      showIdRef.current = createdShowId;

      const firstCreated: { video: { id: number }; upload_url: string }[] =
        showJson?.episodes ??
        showJson?.show?.episodes ??
        showJson?.data?.episodes ??
        [];

      if (firstCreated.length !== firstBatch.length) {
        firstBatch.forEach((ep) =>
          updateEpisode(ep.localId, {
            error: "Episode response count mismatch",
          })
        );
        return false;
      }

      const allCreated: {
        ep: EpisodeUploadState;
        video: { id: number };
        upload_url: string;
      }[] = [];
      firstBatch.forEach((ep, idx) =>
        allCreated.push({
          ep,
          video: firstCreated[idx].video,
          upload_url: firstCreated[idx].upload_url,
        })
      );

      // ── Step 2: Remaining batches (>10 episodes) ──────────────────────────
      for (const batch of remainingBatches) {
        const epRes = await fetch(
          `${BASE_URL}/api/v1/my-shows/${createdShowId}/episodes`,
          {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ episodes: buildEpisodesPayload(batch) }),
          }
        );

        if (!epRes.ok) {
          const err = await epRes.json().catch(() => ({}));
          batch.forEach((ep) =>
            updateEpisode(ep.localId, {
              error: err?.message ?? `Episode create failed (${epRes.status})`,
            })
          );
          return false;
        }

        const epJson = await epRes.json();
        const created: { video: { id: number }; upload_url: string }[] =
          epJson?.episodes ?? epJson?.videos ?? epJson?.data ?? [];

        if (created.length !== batch.length) {
          batch.forEach((ep) =>
            updateEpisode(ep.localId, {
              error: "Episode response count mismatch",
            })
          );
          return false;
        }

        batch.forEach((ep, idx) =>
          allCreated.push({
            ep,
            video: created[idx].video,
            upload_url: created[idx].upload_url,
          })
        );
      }

      // ── Step 3: Update episode titles + descriptions ──────────────────────
      // is_free is intentionally NOT sent here — pricing not set yet.
      // It will be sent correctly in publishAll Step 0.
      await Promise.all(
        allCreated.map(({ ep, video }) => {
          const epMeta = meta.episodesMeta?.find(
            (m) => m.localId === ep.localId
          );
          const finalTitle = epMeta?.title || ep.title || meta.title;
          const finalDesc = epMeta?.description || ep.description || "";

          return fetch(
            `${BASE_URL}/api/v1/my-shows/${createdShowId}/episodes/${video.id}`,
            {
              method: "PUT",
              headers: authHeaders,
              body: JSON.stringify({
                title: finalTitle,
                description: finalDesc,
              }),
            }
          ).catch((err) =>
            console.warn(`Failed to update episode ${video.id} metadata:`, err)
          );
        })
      );

      // ── Step 3b: Upload thumbnail ─────────────────────────────────────────
      if (meta.thumbnailFile) {
        const thumbForm = new FormData();
        thumbForm.append("cover", meta.thumbnailFile);
        fetch(`${BASE_URL}/api/v1/my-shows/${createdShowId}/cover`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: thumbForm,
        }).catch((err) => console.warn("Failed to upload thumbnail:", err));
      }

      // ── Step 4: Upload files to Mux in parallel ───────────────────────────
      const results = await Promise.allSettled(
        allCreated.map(({ ep, video, upload_url }) => {
          updateEpisode(ep.localId, {
            apiVideoId: video.id,
            uploadUrl: upload_url,
            muxStatus: "waiting",
            uploadProgress: 0,
          });
          return uploadToMux(upload_url, ep.file!, (pct) =>
            updateEpisode(ep.localId, { uploadProgress: pct })
          ).then(() => {
            updateEpisode(ep.localId, {
              uploadProgress: 100,
              muxStatus: "preparing",
            });
            pollUntilReady(ep.localId, video.id);
            return video.id;
          });
        })
      );

      results.forEach((result, i) => {
        if (result.status === "rejected") {
          updateEpisode(allCreated[i].ep.localId, {
            error: result.reason?.message ?? "Upload failed",
          });
        }
      });

      return results.every((r) => r.status === "fulfilled");
    },
    [updateEpisode]
  );

  const pollUntilReady = useCallback(
    (localId: string, knownVideoId?: number): Promise<boolean> => {
      if (pollTimers.current[localId]) {
        clearInterval(pollTimers.current[localId]);
        delete pollTimers.current[localId];
      }
      return new Promise((resolve) => {
        const startTime = Date.now();
        if (!knownVideoId) {
          resolve(false);
          return;
        }
        const tick = async () => {
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
              `${BASE_URL}/api/v1/my-videos/${knownVideoId}`,
              {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              }
            );
            if (!res.ok) return;
            const data = await res.json();
            const muxStatus: MuxStatus =
              data?.data?.mux_status ?? data?.mux_status;
            const duration: number | null =
              data?.data?.duration ?? data?.duration ?? null;
            updateEpisode(localId, {
              muxStatus,
              ...(duration !== null ? { durationSeconds: duration } : {}),
            });
            if (muxStatus === "ready" || muxStatus === "errored") {
              clearInterval(pollTimers.current[localId]);
              delete pollTimers.current[localId];
              resolve(muxStatus === "ready");
            }
          } catch {
            /* transient */
          }
        };
        tick();
        pollTimers.current[localId] = setInterval(tick, POLL_INTERVAL_MS);
      });
    },
    [updateEpisode]
  );

  // Upload a single episode file immediately to an already-created show.
  // Called when the user adds a 2nd, 3rd… file after the first uploadAll() ran.
  const uploadSingle = useCallback(
    async (
      localId: string,
      file: File,
      epMeta: { title: string; description: string }
    ): Promise<void> => {
      const currentShowId = showIdRef.current;
      if (!currentShowId) return; // show not created yet — uploadAll handles first file

      const token = await getTokenRef.current();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Try flat single-episode format first; the batch endpoint uses { episodes: [...] }
      // but the single-episode endpoint may expect { title, description, is_free }
      const epRes = await fetch(
        `${BASE_URL}/api/v1/my-shows/${currentShowId}/episodes`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            title: epMeta.title,
            description: epMeta.description || "",
            is_free: true, // overridden in publishAll
          }),
        }
      );

      if (!epRes.ok) {
        updateEpisode(localId, { error: `Episode create failed (${epRes.status})` });
        return;
      }

      const epJson = await epRes.json();

      // Handle both single-object and array response shapes
      const singleEp: { video?: { id: number }; upload_url?: string; id?: number } | null =
        epJson?.data ?? epJson?.episode ?? epJson ?? null;
      const created: { video: { id: number }; upload_url: string }[] =
        epJson?.episodes ?? epJson?.videos ?? (singleEp && singleEp.upload_url ? [singleEp as any] : []);

      if (!created[0]) {
        updateEpisode(localId, { error: "No upload URL returned" });
        return;
      }

      const { video, upload_url } = created[0];
      updateEpisode(localId, {
        apiVideoId: video.id,
        uploadUrl: upload_url,
        muxStatus: "waiting",
        uploadProgress: 0,
      });

      try {
        await uploadToMux(upload_url, file, (pct) =>
          updateEpisode(localId, { uploadProgress: pct })
        );
        updateEpisode(localId, { uploadProgress: 100, muxStatus: "preparing" });
        pollUntilReady(localId, video.id);
      } catch (err: any) {
        updateEpisode(localId, { error: err?.message ?? "Upload failed" });
      }
    },
    [updateEpisode, pollUntilReady]
  );

  // Push episode titles + descriptions to the backend after the user has typed them.
  // Called from handleUploadNext (when clicking Continue on the upload step).
  const syncEpisodesMeta = useCallback(
    async (episodesMeta: EpisodeMeta[]): Promise<void> => {
      const currentShowId = showIdRef.current;
      if (!currentShowId) return;
      const token = await getTokenRef.current();
      const authHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      let currentEps: EpisodeUploadState[] = [];
      setEpisodes((prev) => { currentEps = prev; return prev; });
      await new Promise((r) => setTimeout(r, 0));
      await Promise.all(
        currentEps
          .filter((ep) => ep.apiVideoId !== null)
          .map((ep) => {
            const meta = episodesMeta.find((m) => m.localId === ep.localId);
            if (!meta) return Promise.resolve();
            return fetch(
              `${BASE_URL}/api/v1/my-shows/${currentShowId}/episodes/${ep.apiVideoId}`,
              {
                method: "PUT",
                headers: authHeaders,
                body: JSON.stringify({
                  title: meta.title,
                  description: meta.description || "",
                }),
              }
            ).catch(() => {});
          })
      );
    },
    []
  );

  const publishAll = useCallback(
    async (meta: ShowMeta): Promise<boolean> => {
      setIsPublishing(true);
      setPublishError(null);

      try {
        if (!showId) {
          setPublishError("No show to publish.");
          return false;
        }
        if (!walletAddress) {
          setPublishError("No wallet connected.");
          return false;
        }

        const token = await getTokenRef.current();
        const authHeaders: Record<string, string> = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        // ── Step 0: Update episode pricing with correct is_free values ────────
        // This is the ONLY place is_free is set correctly — after the user has
        // completed the pricing step and before we publish.
        // episodesMeta comes from handlePublish in CreatePage which maps the
        // current episodes state (with user's paid/free toggles).
        console.log("Step 0 — episodesMeta received:", meta.episodesMeta);

        if (meta.episodesMeta && meta.episodesMeta.length > 0) {
          // Snapshot current episode state to get apiVideoId for each episode
          let currentEps: EpisodeUploadState[] = [];
          setEpisodes((prev) => {
            currentEps = prev;
            return prev;
          });
          await new Promise((r) => setTimeout(r, 0));

          console.log(
            "Step 0 — episode videoIds:",
            currentEps.map((e) => ({
              localId: e.localId,
              videoId: e.apiVideoId,
            }))
          );

          await Promise.all(
            currentEps
              .filter((ep) => ep.apiVideoId !== null)
              .map((ep) => {
                const epMeta = meta.episodesMeta!.find(
                  (m) => m.localId === ep.localId
                );
                const isFree = epMeta ? !epMeta.isPaid : true;

                console.log(
                  `Step 0 — episode ${ep.apiVideoId} (${ep.localId}): isPaid=${epMeta?.isPaid}, sending is_free=${isFree}`
                );

                return fetch(
                  `${BASE_URL}/api/v1/my-shows/${showId}/episodes/${ep.apiVideoId}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      ...authHeaders,
                    },
                    body: JSON.stringify({ is_free: isFree }),
                  }
                ).catch((err) =>
                  console.warn(
                    `Failed to update episode ${ep.apiVideoId} pricing:`,
                    err
                  )
                );
              })
          );
        }

        // ── Step 1: Publish on backend ────────────────────────────────────────
        const publishRes = await fetch(
          `${BASE_URL}/api/v1/my-shows/${showId}/publish`,
          {
            method: "POST",
            headers: authHeaders,
          }
        );

        if (!publishRes.ok) {
          const err = await publishRes.json().catch(() => ({}));
          setPublishError(
            err?.message ?? `Publish failed (${publishRes.status})`
          );
          return false;
        }

        // ── Step 2: Create show on-chain ──────────────────────────────────────
        const chainResult = await createOnChainShow({
          title: meta.title,
          tickName: deriveTickName(meta.title),
          tickSymbol: meta.tickSymbol?.trim() || deriveTickSymbol(meta.title),
          creatorAddress: walletAddress,
          curveTier: 1,
        });

        if (!chainResult) {
          setPublishError(
            "Show published but on-chain registration failed. You can retry from Studio."
          );
          return true;
        }

        // ── Step 2b: Register episodes on-chain ─────────────────────────────
        // addEpisode() must be called for each episode on the ShowContract
        // before buyAndUnlock() will work. Without this, the contract reverts
        // with "episode does not exist".
        let currentEpsForChain: EpisodeUploadState[] = [];
        setEpisodes((prev) => {
          currentEpsForChain = prev;
          return prev;
        });
        await new Promise((r) => setTimeout(r, 0));

        for (const ep of currentEpsForChain.filter(
          (e) => e.apiVideoId !== null
        )) {
          const epMeta = meta.episodesMeta?.find(
            (m) => m.localId === ep.localId
          );
          const isFree = epMeta ? !epMeta.isPaid : true;
          // Duration from Mux in seconds — fallback to 60s if not yet available
          const durationSeconds = ep.durationSeconds ?? 60;

          console.log(
            `Adding episode on-chain: videoId=${ep.apiVideoId}, duration=${durationSeconds}s, isFree=${isFree}`
          );

          const result = await addEpisodeOnChain({
            showContractAddress: chainResult.showInfo.showContract,
            durationSeconds,
            isFree,
          });

          if (result) {
            console.log(
              `Episode ${ep.apiVideoId} registered on-chain as episodeId=${result.onChainEpisodeId}`
            );
            // Save on-chain episode ID to backend so frontend can use it for access checks
            if (ep.apiVideoId) {
              fetch(
                `${BASE_URL}/api/v1/my-shows/${showId}/episodes/${ep.apiVideoId}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    ...authHeaders,
                  },
                  body: JSON.stringify({
                    on_chain_episode_id: result.onChainEpisodeId.toString(),
                  }),
                }
              ).catch((err) =>
                console.warn("Failed to save on-chain episode ID:", err)
              );
            }
          } else {
            console.warn(
              `Failed to register episode ${ep.apiVideoId} on-chain`
            );
          }
        }

        // ── Step 3: Save contract addresses to backend ────────────────────────
        const { showId: onChainShowId, showInfo } = chainResult;

        const patchRes = await fetch(
          `${BASE_URL}/api/v1/my-shows/${showId}/chain-info`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...authHeaders },
            body: JSON.stringify({
              on_chain_show_id: onChainShowId.toString(),
              show_contract: showInfo.showContract,
              bonding_curve: showInfo.bondingCurve,
              tix_token: showInfo.tix,
              fee_distributor: showInfo.feeDistributor,
            }),
          }
        );

        if (!patchRes.ok)
          console.warn("Failed to save chain info:", await patchRes.text());

        setOnChainInfo({
          onChainShowId: onChainShowId.toString(),
          showContract: showInfo.showContract,
          bondingCurve: showInfo.bondingCurve,
          tixToken: showInfo.tix,
          feeDistributor: showInfo.feeDistributor,
        });

        return true;
      } finally {
        setIsPublishing(false);
      }
    },
    [showId, walletAddress, createOnChainShow, addEpisodeOnChain]
  );

  return {
    episodes,
    isPublishing,
    publishError,
    showId,
    onChainInfo,
    attachFile,
    addUploadSlot,
    initEpisodes,
    uploadAll,
    uploadSingle,
    syncEpisodesMeta,
    pollUntilReady,
    publishAll,
  };
}
