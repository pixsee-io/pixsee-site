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
      <div className="bg-neutral-primary rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-neutral-tertiary-border">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-semantic-error-primary/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-semantic-error-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-neutral-primary-text mb-1">
              {title}
            </h3>
            <p className="text-sm text-neutral-tertiary-text">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-neutral-secondary-text hover:bg-neutral-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-semantic-error-primary text-white hover:opacity-90 transition-opacity flex items-center gap-2"
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
      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-neutral-secondary hover:bg-neutral-tertiary transition-colors group">
        <div className="relative w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden bg-neutral-tertiary flex-shrink-0">
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
              <Film className="w-5 h-5 text-neutral-tertiary-text" />
            </div>
          )}
          {episode.duration && (
            <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[10px] px-1 rounded">
              {formatDuration(episode.duration)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-0.5">
            <span className="text-[11px] sm:text-xs text-neutral-tertiary-text">
              S{episode.season_number}E{episode.episode_number}
            </span>
            <span
              className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${
                episode.is_free
                  ? "bg-semantic-success-subtle text-semantic-success-text"
                  : "bg-brand-pixsee-secondary/10 text-brand-pixsee-secondary"
              }`}
            >
              {episode.is_free ? "Free" : "Paid"}
            </span>
            {episode.mux_status !== "ready" && (
              <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full bg-semantic-warning-primary/10 text-semantic-warning-text capitalize">
                {episode.mux_status}
              </span>
            )}
          </div>
          <p className="font-medium text-xs sm:text-sm text-neutral-primary-text truncate">
            {episode.title}
          </p>
          <p className="text-[11px] sm:text-xs text-neutral-tertiary-text mt-0.5">
            {episode.view_count.toLocaleString()} views
          </p>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-lg hover:bg-neutral-tertiary transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Episode options"
          >
            <svg
              className="w-4 h-4 text-neutral-tertiary-text"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-neutral-primary rounded-xl shadow-xl border border-neutral-tertiary-border z-10 w-44 overflow-hidden">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowConfirm(true);
                }}
                disabled={hasOnChainPurchases}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-semantic-error-primary hover:bg-semantic-error-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                Delete episode
              </button>
              {hasOnChainPurchases && (
                <p className="px-4 py-2 text-xs text-neutral-tertiary-text border-t border-neutral-tertiary-border">
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
  const params = useParams<{ showId: string }>();
  const router = useRouter();
  const showId = Number(params?.showId);

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
      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};
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
      <div className="min-h-screen bg-foundation-alternate flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-pixsee-secondary" />
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
    <div className="min-h-screen bg-foundation-alternate">
      {toast && (
        <div
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 left-4 sm:left-auto z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "success"
              ? "bg-semantic-success-primary text-white"
              : "bg-semantic-error-primary text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <button
          onClick={() => router.push("/dashboard/studio")}
          className="flex items-center gap-2 text-sm text-neutral-tertiary-text hover:text-neutral-primary-text transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Studio
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-primary-text truncate">
              {show.title}
            </h1>
            <div className="flex items-center flex-wrap gap-2 mt-1.5">
              <span
                className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full ${
                  show.status === "published"
                    ? "bg-semantic-success-subtle text-semantic-success-text"
                    : "bg-neutral-tertiary text-neutral-secondary-text"
                }`}
              >
                {show.status === "published" ? "Live" : "Draft"}
              </span>
              {show.on_chain_show_id && (
                <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-brand-pixsee-secondary/10 text-brand-pixsee-secondary">
                  On-chain #{show.on_chain_show_id}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                show.status === "published"
                  ? "bg-neutral-tertiary text-neutral-secondary-text hover:bg-neutral-secondary"
                  : "bg-semantic-success-primary text-white hover:opacity-90"
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
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white transition-opacity"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1 space-y-4 sm:space-y-5">
            {/* Cover */}
            <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border overflow-hidden">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-secondary">
                    <Film className="w-10 h-10 text-neutral-tertiary-text" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Upload className="w-4 h-4" /> Change cover
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-neutral-tertiary-border">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-center text-xs text-neutral-tertiary-text hover:text-brand-pixsee-secondary transition-colors"
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
            <div className="bg-neutral-primary rounded-2xl border border-semantic-error-primary/30 p-4">
              <h3 className="text-sm font-semibold text-semantic-error-primary mb-3">
                Danger Zone
              </h3>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={hasOnChainPurchases}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-semantic-error-primary/40 text-semantic-error-primary hover:bg-semantic-error-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" /> Delete show
              </button>
              {hasOnChainPurchases && (
                <p className="text-xs text-neutral-tertiary-text mt-2 text-center">
                  This show has purchases — deletion is blocked.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4 sm:space-y-5">
            {/* Edit form */}
            <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4 sm:p-5">
              <h2 className="font-semibold text-neutral-primary-text mb-3 sm:mb-4">
                Show details
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-tertiary-text mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-tertiary-border bg-neutral-secondary text-sm text-neutral-primary-text focus:outline-none focus:border-brand-pixsee-secondary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-tertiary-text mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-tertiary-border bg-neutral-secondary text-sm text-neutral-primary-text focus:outline-none focus:border-brand-pixsee-secondary transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-tertiary-text mb-1.5">
                    Tags <span className="font-normal">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="drama, thriller, series"
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-tertiary-border bg-neutral-secondary text-sm text-neutral-primary-text focus:outline-none focus:border-brand-pixsee-secondary transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Episodes */}
            <div className="bg-neutral-primary rounded-2xl border border-neutral-tertiary-border p-4 sm:p-5">
              <h2 className="font-semibold text-neutral-primary-text mb-3 sm:mb-4">
                Episodes{" "}
                <span className="text-neutral-tertiary-text font-normal">
                  ({show.episodes.length})
                </span>
              </h2>
              {show.episodes.length === 0 ? (
                <div className="text-center py-8 text-neutral-tertiary-text text-sm">
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
