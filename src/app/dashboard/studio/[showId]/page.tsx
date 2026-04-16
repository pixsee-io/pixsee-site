"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Film,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useDeleteEpisode } from "@/app/hooks/useStudio";

const BASE_URL = process.env.NEXT_PUBLIC_PIXSEE_API_URL ?? "";

type Episode = {
  id: number;
  title: string;
  description: string | null;
  mux_status: string;
  mux_playback_id: string | null;
  duration: number | null;
  thumbnail_url: string | null;
  is_free: boolean;
  view_count: number;
  status: string;
  season_number: number;
  episode_number: number;
};

type Show = {
  id: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  cover_image_url: string | null;
  status: "draft" | "published";
  on_chain_show_id: string | null;
  episodes: Episode[];
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EpisodeRow({
  episode,
  showId,
  hasOnChainPurchases,
  onDeleted,
}: {
  episode: Episode;
  showId: number;
  hasOnChainPurchases: boolean;
  onDeleted: (id: number) => void;
}) {
  const { getAccessToken } = usePrivy();
  const { deleteEpisode, isDeleting } = useDeleteEpisode(getAccessToken);
  const [showConfirm, setShowConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    const ok = await deleteEpisode(showId, episode.id);
    if (ok) {
      setShowConfirm(false);
      onDeleted(episode.id);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group">
        <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
          {episode.thumbnail_url ? (
            <Image
              src={episode.thumbnail_url}
              alt={episode.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="w-5 h-5 text-neutral-400" />
            </div>
          )}
          {episode.duration && (
            <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[10px] px-1 rounded">
              {formatDuration(episode.duration)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-neutral-400">
              S{episode.season_number}E{episode.episode_number}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                episode.is_free
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-brand-pixsee-primary/10 text-brand-pixsee-primary"
              }`}
            >
              {episode.is_free ? "Free" : "Paid"}
            </span>
            {episode.mux_status !== "ready" && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 capitalize">
                {episode.mux_status}
              </span>
            )}
          </div>
          <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">
            {episode.title}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {episode.view_count.toLocaleString()} views
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg
              className="w-4 h-4 text-neutral-500"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 z-10 w-44 overflow-hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowConfirm(true);
                }}
                disabled={hasOnChainPurchases}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete episode
              </button>
              {hasOnChainPurchases && (
                <p className="px-4 py-2 text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-700">
                  Has purchases — cannot delete
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      {showConfirm && (
        <DeleteConfirmModal
          title="Delete episode?"
          message={`"${episode.title}" will be permanently removed. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}

export default function StudioShowPage() {
  const { getAccessToken } = usePrivy();
  const params = useParams();
  const router = useRouter();
  const showId = Number(params.showId);

  const [show, setShow] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeletingShow, setIsDeletingShow] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  const fetchShow = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/v1/my-shows/${showId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to load show");
      const json = await res.json();
      const data: Show = json?.data ?? json?.show ?? json;
      setShow(data);
      setEditTitle(data.title);
      setEditDescription(data.description ?? "");
      setEditTags((data.tags ?? []).join(", "));
    } catch {
      showToast("error", "Failed to load show");
    } finally {
      setIsLoading(false);
    }
  }, [showId, getAccessToken, showToast]);

  useEffect(() => {
    fetchShow();
  }, [fetchShow]);

  const hasOnChainPurchases =
    !!show?.on_chain_show_id &&
    (show.episodes?.reduce((sum, ep) => sum + ep.view_count, 0) ?? 0) > 0;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!show) return;
    setIsSaving(true);
    try {
      const token = await getAccessToken();
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      const metaRes = await fetch(`${BASE_URL}/api/v1/my-shows/${showId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          tags: editTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      if (!metaRes.ok) throw new Error("Failed to save");
      if (coverFile) {
        const form = new FormData();
        form.append("cover", coverFile);
        await fetch(`${BASE_URL}/api/v1/my-shows/${showId}/cover`, {
          method: "POST",
          headers: authHeaders,
          body: form,
        });
      }
      showToast("success", "Changes saved");
      fetchShow();
    } catch {
      showToast("error", "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!show) return;
    setIsPublishing(true);
    try {
      const token = await getAccessToken();
      const endpoint =
        show.status === "published"
          ? `${BASE_URL}/api/v1/my-shows/${showId}/unpublish`
          : `${BASE_URL}/api/v1/my-shows/${showId}/publish`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed");
      showToast(
        "success",
        show.status === "published" ? "Show unpublished" : "Show published"
      );
      fetchShow();
    } catch {
      showToast("error", "Failed to update publish status");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteShow = async () => {
    setIsDeletingShow(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${BASE_URL}/api/v1/my-shows/${showId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/dashboard/studio");
    } catch {
      showToast("error", "Failed to delete show");
      setIsDeletingShow(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-pixsee-primary" />
      </div>
    );
  }

  if (!show) return null;

  const hasChanges =
    editTitle !== show.title ||
    editDescription !== (show.description ?? "") ||
    editTags !== (show.tags ?? []).join(", ") ||
    !!coverFile;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.push("/dashboard/studio")}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Studio
        </button>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {show.title}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  show.status === "published"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {show.status === "published" ? "Live" : "Draft"}
              </span>
              {show.on_chain_show_id && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-pixsee-primary/10 text-brand-pixsee-primary">
                  On-chain #{show.on_chain_show_id}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                show.status === "published"
                  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isPublishing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : show.status === "published" ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              {show.status === "published" ? "Unpublish" : "Publish"}
            </button>
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-brand-pixsee-primary text-white hover:opacity-90 transition-opacity"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-5">
            {/* Cover */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div
                className="relative aspect-video cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview || show.cover_image_url ? (
                  <Image
                    src={coverPreview ?? show.cover_image_url!}
                    alt={show.title}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                    <Film className="w-10 h-10 text-neutral-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Upload className="w-4 h-4" /> Change cover
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-center text-xs text-neutral-500 hover:text-brand-pixsee-primary transition-colors"
                >
                  Click to upload new cover image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-4">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
                Danger Zone
              </h3>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={hasOnChainPurchases}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" /> Delete show
              </button>
              {hasOnChainPurchases && (
                <p className="text-xs text-neutral-400 mt-2 text-center">
                  This show has purchases — deletion is blocked.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            {/* Edit form */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
              <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">
                Show details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-pixsee-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-pixsee-primary transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                    Tags <span className="font-normal">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="drama, thriller, series"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-brand-pixsee-primary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Episodes */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
              <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">
                Episodes{" "}
                <span className="text-neutral-400 font-normal">
                  ({show.episodes.length})
                </span>
              </h2>
              {show.episodes.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  No episodes yet
                </div>
              ) : (
                <div className="space-y-2">
                  {show.episodes.map((ep) => (
                    <EpisodeRow
                      key={ep.id}
                      episode={ep}
                      showId={show.id}
                      hasOnChainPurchases={hasOnChainPurchases}
                      onDeleted={(id) => {
                        setShow((prev) =>
                          prev
                            ? {
                                ...prev,
                                episodes: prev.episodes.filter(
                                  (e) => e.id !== id
                                ),
                              }
                            : prev
                        );
                        showToast("success", "Episode deleted");
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          title="Delete this show?"
          message={`"${show.title}" and all its episodes will be permanently removed.`}
          onConfirm={handleDeleteShow}
          onCancel={() => setShowDeleteConfirm(false)}
          isDeleting={isDeletingShow}
        />
      )}
    </div>
  );
}
