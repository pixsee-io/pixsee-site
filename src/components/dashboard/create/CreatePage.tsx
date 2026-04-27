"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Upload,
  Tag,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Info,
  Lightbulb,
  X,
  Loader2,
  Film,
  LayoutList,
} from "lucide-react";
import Image from "next/image";
import { usePrivy } from "@privy-io/react-auth";

import { EpisodeUploadState, useCreateShow } from "@/app/hooks/useCreateShow";
import { usePixseeContract } from "@/app/hooks/usePixseeContract";

//  Types

type StepId = "details" | "upload" | "pricing" | "review" | "launch";

type Episode = {
  id: string;
  title: string;
  description: string;
  isPaid: boolean;
  previewUrl?: string; // object URL from selected video file
};

type ShowDetails = {
  thumbnail: File | null;
  thumbnailPreview: string | null;
  title: string;
  tickSymbol: string;
  videoFormat: "landscape" | "portrait";
  description: string;
  tags: string[];
  language: string;
  licence: string;
  safeForKids: boolean;
  age18Plus: boolean;
  embedding: boolean;
  notifyFollowers: boolean;
};

const steps: { id: StepId; label: string; number: number }[] = [
  { id: "details", label: "Details", number: 1 },
  { id: "upload", label: "Upload Media", number: 2 },
  { id: "pricing", label: "Pricing", number: 3 },
  { id: "review", label: "Review", number: 4 },
  { id: "launch", label: "Launch", number: 5 },
];

const initialEpisodes: Episode[] = [
  { id: "1", title: "Episode 1", description: "", isPaid: false },
];

const ToggleSwitch = ({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
      enabled ? "bg-brand-pixsee-secondary" : "bg-neutral-tertiary"
    )}
  >
    <span
      className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
        enabled ? "translate-x-6" : "translate-x-1"
      )}
    />
  </button>
);

const StepIndicator = ({
  currentStep,
  completedSteps,
}: {
  currentStep: StepId;
  completedSteps: StepId[];
}) => {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  return (
    <>
      <div className="flex sm:hidden items-center mb-6">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all",
                  isCompleted
                    ? "bg-brand-primary text-white"
                    : isCurrent
                    ? "bg-brand-primary text-white ring-4 ring-brand-primary/20"
                    : "bg-neutral-primary border border-neutral-tertiary-border text-neutral-tertiary-text"
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.number}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-1",
                    index < currentIndex
                      ? "bg-brand-primary"
                      : "bg-neutral-tertiary"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="hidden sm:flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isPast = index < currentIndex;
          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 lg:px-6 py-2 rounded-full text-xs lg:text-sm font-medium transition-all whitespace-nowrap",
                    isCompleted || isCurrent
                      ? "bg-brand-primary text-white"
                      : "bg-neutral-primary border border-neutral-tertiary-border text-neutral-secondary-text"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                        isCurrent
                          ? "bg-white text-brand-primary"
                          : "bg-neutral-tertiary text-neutral-secondary-text"
                      )}
                    >
                      {step.number}
                    </span>
                  )}
                  <span>{step.label}</span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-1 lg:mx-2",
                    isPast || isCompleted
                      ? "bg-brand-primary"
                      : "bg-neutral-tertiary"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
};

const StepNav = ({
  onBack,
  onNext,
  nextLabel = "Next",
  nextDisabled = false,
  isLoading = false,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}) => (
  <>
    <div className="flex items-center justify-between mt-6 gap-3">
      <Button
        variant="outline"
        onClick={onBack}
        className="rounded-full px-6 sm:px-8 gap-2 flex-1 sm:flex-none"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled || isLoading}
        className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-6 sm:px-12 gap-2 flex-1 sm:flex-none disabled:opacity-60"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
    <p className="flex items-center gap-2 text-sm text-semantic-error-primary mt-4">
      <Info className="w-4 h-4 flex-shrink-0" />
      You can edit everything later in Studio.
    </p>
  </>
);

//  Upload Queue (now driven by real EpisodeUploadState)

const UploadQueue = ({
  uploadStates,
}: {
  uploadStates: EpisodeUploadState[];
}) => (
  <div className="bg-brand-pixsee-tertiary rounded-xl p-4 space-y-4">
    {uploadStates
      .filter((ep) => ep.file)
      .map((ep) => {
        const statusLabel =
          ep.muxStatus === "ready"
            ? "Ready"
            : ep.muxStatus === "preparing"
            ? "Processing…"
            : ep.uploadProgress === 100
            ? "Uploaded — waiting for Mux…"
            : ep.uploadProgress > 0
            ? "Uploading…"
            : "Queued";

        return (
          <div key={ep.localId}>
            <div className="flex items-center justify-between mb-1 gap-2">
              <div className="min-w-0">
                <p className="font-medium text-neutral-primary-text truncate">
                  {ep.file!.name}
                </p>
                <p className="text-sm text-neutral-tertiary-text">
                  {(ep.file!.size / (1024 * 1024 * 1024)).toFixed(2)} GB ·{" "}
                  {statusLabel}
                </p>
                {ep.error && (
                  <p className="text-xs text-semantic-error-primary mt-0.5">
                    {ep.error}
                  </p>
                )}
              </div>
              <span className="text-sm text-neutral-tertiary-text flex-shrink-0">
                {ep.uploadProgress}%
              </span>
            </div>
            <div className="h-2 bg-neutral-primary/80 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  ep.muxStatus === "ready"
                    ? "bg-semantic-success-primary"
                    : ep.error
                    ? "bg-semantic-error-primary"
                    : "bg-brand-pixsee-secondary"
                )}
                style={{ width: `${ep.uploadProgress}%` }}
              />
            </div>
          </div>
        );
      })}
    {uploadStates.filter((ep) => ep.file).length === 0 && (
      <p className="text-sm text-neutral-tertiary-text text-center py-2">
        No files attached yet.
      </p>
    )}
  </div>
);

//  Main Page

const CreatePage = () => {
  const { getAccessToken } = usePrivy();
  const {
    createShow: createOnChainShow,
    addEpisode: addEpisodeOnChain,
    walletAddress,
  } = usePixseeContract();

  const router = useRouter();
  const {
    episodes: uploadStates,
    isPublishing,
    publishError,
    showId,
    onChainInfo, // contains showContract, bondingCurve etc after launch
    initEpisodes,
    attachFile,
    addUploadSlot,
    uploadAll,
    uploadSingle,
    syncEpisodesMeta,
    pollUntilReady,
    publishAll,
  } = useCreateShow({
    getAccessToken,
    walletAddress,
    createOnChainShow,
    addEpisodeOnChain,
  });

  const [currentStep, setCurrentStep] = useState<StepId>("details");
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [contentType, setContentType] = useState<"single" | "series">("single");
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [tagInput, setTagInput] = useState("");
  const [showDetails, setShowDetails] = useState<ShowDetails>({
    thumbnail: null,
    thumbnailPreview: null,
    title: "",
    tickSymbol: "",
    videoFormat: "landscape",
    description: "",
    tags: [],
    language: "English",
    licence: "Pixsee (Default)",
    safeForKids: true,
    age18Plus: false,
    embedding: false,
    notifyFollowers: true,
  });

  const [uploadTriggered, setUploadTriggered] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const markComplete = (step: StepId) => {
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
  };

  const goToStep = (id: StepId) => setCurrentStep(id);

  //  Step handlers

  const handleDetailsNext = () => {
    if (!showDetails.title.trim()) return;
    initEpisodes(
      episodes.map((ep) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
      }))
    );
    markComplete("details");
    goToStep("upload");
  };

  const startUpload = () => {
    if (uploadTriggered) return;
    setUploadTriggered(true);
    const showType = contentType === "series" ? "tv_show" : "movie";
    uploadAll({
      title: showDetails.title,
      description: showDetails.description,
      tags: showDetails.tags,
      language: showDetails.language,
      thumbnailFile: showDetails.thumbnail,
      showType,
      videoFormat: showDetails.videoFormat,
      tickSymbol: showDetails.tickSymbol,
      episodesMeta: episodes.map((ep) => ({
        localId: ep.id,
        title: ep.title,
        description: ep.description,
        isPaid: ep.isPaid,
      })),
    });
  };

  const handleUploadNext = () => {
    // Push final episode titles/descriptions before advancing
    syncEpisodesMeta(
      episodes.map((ep) => ({
        localId: ep.id,
        title: ep.title,
        description: ep.description,
        isPaid: ep.isPaid,
      }))
    );
    markComplete("upload");
    goToStep("pricing");
  };

  const handlePricingNext = () => {
    markComplete("pricing");
    goToStep("review");
  };

  const handleReviewNext = async () => {
    // Polls already started in handleUploadNext — just wait if still processing
    const stillProcessing = uploadStates.filter(
      (ep) =>
        ep.muxStatus !== "ready" && ep.muxStatus !== "errored" && ep.apiVideoId
    );
    if (stillProcessing.length > 0) {
      await Promise.all(
        stillProcessing.map((ep) => pollUntilReady(ep.localId))
      );
    }
    markComplete("review");
    goToStep("launch");
  };

  const handlePublish = async () => {
    const ok = await publishAll({
      title: showDetails.title,
      description: showDetails.description,
      tags: showDetails.tags,
      language: showDetails.language,
      thumbnailFile: showDetails.thumbnail,
      showType: contentType === "series" ? "tv_show" : "movie",
      videoFormat: showDetails.videoFormat,
      tickSymbol: showDetails.tickSymbol,
      episodesMeta: episodes.map((ep) => ({
        localId: ep.id,
        title: ep.title,
        description: ep.description,
        isPaid: ep.isPaid,
      })),
    });
    if (ok) router.push("/dashboard/watch");
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setCurrentStep(steps[prevIndex].id);
  };

  //  Helpers

  const removeTag = (tag: string) =>
    setShowDetails((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }));

  const addTag = (tag: string) => {
    const trimmed = tag.trim().replace(/,$/, "");
    if (trimmed && !showDetails.tags.includes(trimmed)) {
      setShowDetails((d) => ({ ...d, tags: [...d.tags, trimmed] }));
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    }
  };

  const updateEpisode = (id: string, updates: Partial<Episode>) =>
    setEpisodes((eps) =>
      eps.map((ep) => (ep.id === id ? { ...ep, ...updates } : ep))
    );

  const addEpisode = () => {
    const newId = String(episodes.length + 1);
    const newEp = {
      id: newId,
      title: `Episode ${newId}`,
      description: "",
      isPaid: false,
      price: "",
    };
    setEpisodes((eps) => [...eps, newEp]);
    // Sync a new empty slot into uploadStates without wiping existing files
    addUploadSlot(newId, `Episode ${newId}`);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setShowDetails((d) => ({
      ...d,
      thumbnail: file,
      thumbnailPreview: preview,
    }));
  };

  const handleVideoFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    episodeId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    attachFile(episodeId, file);
    const previewUrl = URL.createObjectURL(file);
    setEpisodes((prev) =>
      prev.map((ep) => (ep.id === episodeId ? { ...ep, previewUrl } : ep))
    );

    if (!uploadTriggered) {
      // First file — create the show and upload everything via uploadAll
      setTimeout(() => startUpload(), 0);
    } else {
      // Show already created — upload this episode directly
      const ep = episodes.find((ep) => ep.id === episodeId);
      uploadSingle(episodeId, file, {
        title: ep?.title ?? `Episode ${episodeId}`,
        description: ep?.description ?? "",
      });
    }
  };

  //  Shared row

  const LanguageLicenceRow = ({ disabled = false }: { disabled?: boolean }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-primary-text w-16 sm:w-auto">
          Language
        </span>
        <select
          value={showDetails.language}
          disabled={disabled}
          onChange={(e) =>
            setShowDetails((d) => ({ ...d, language: e.target.value }))
          }
          className="flex-1 sm:flex-none px-3 py-2 border border-neutral-tertiary-border rounded-lg text-sm bg-neutral-primary text-neutral-primary-text disabled:bg-neutral-secondary"
        >
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-primary-text w-16 sm:w-auto">
          License
        </span>
        <select
          value={showDetails.licence}
          disabled={disabled}
          onChange={(e) =>
            setShowDetails((d) => ({ ...d, licence: e.target.value }))
          }
          className="flex-1 sm:flex-none px-3 py-2 border border-neutral-tertiary-border rounded-lg text-sm bg-neutral-primary text-neutral-primary-text disabled:bg-neutral-secondary"
        >
          <option>Pixsee (Default)</option>
          <option>Creative Commons</option>
        </select>
      </div>
    </div>
  );

  // ─
  // Step renderers
  // ─

  const renderDetails = () => (
    <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
      <h2 className="text-xl font-paytone text-neutral-primary-text mb-2">
        Watch Details
      </h2>
      <p className="text-neutral-tertiary-text mb-6">
        Describe your show so viewers and algorithms can find it.
      </p>

      {/* Content type toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-primary-text mb-3">
          Content Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(["single", "series"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setContentType(type);
                // Reset episodes to a single slot when switching
                setEpisodes([
                  {
                    id: "1",
                    title: "Episode 1",
                    description: "",
                    isPaid: false,
                    // price: "",
                  },
                ]);
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors text-sm font-medium",
                contentType === type
                  ? "border-brand-pixsee-secondary bg-brand-pixsee-secondary/5 text-brand-pixsee-secondary"
                  : "border-neutral-tertiary-border text-neutral-tertiary-text hover:border-brand-pixsee-secondary/50"
              )}
            >
              {type === "single" ? (
                <>
                  <Film className="w-6 h-6" />
                  <span>Single Video</span>
                  <span className="text-xs font-normal text-neutral-tertiary-text">
                    A movie, short, or reel
                  </span>
                </>
              ) : (
                <>
                  <LayoutList className="w-6 h-6" />
                  <span>Series / Episodes</span>
                  <span className="text-xs font-normal text-neutral-tertiary-text">
                    Multiple episodes in a series
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Format */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-primary-text mb-3">
          Video Format
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "landscape", label: "Landscape", sub: "16:9 — Standard HD", icon: "▬" },
              { value: "portrait", label: "Portrait", sub: "9:16 — Vertical / Short", icon: "▮" },
            ] as const
          ).map(({ value, label, sub, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setShowDetails((d) => ({ ...d, videoFormat: value }))}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors text-sm font-medium",
                showDetails.videoFormat === value
                  ? "border-brand-pixsee-secondary bg-brand-pixsee-secondary/5 text-brand-pixsee-secondary"
                  : "border-neutral-tertiary-border text-neutral-tertiary-text hover:border-brand-pixsee-secondary/50"
              )}
            >
              <span className="text-2xl leading-none">{icon}</span>
              <span>{label}</span>
              <span className="text-xs font-normal text-neutral-tertiary-text">{sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-primary-text mb-2">
          Upload Thumbnail
        </label>
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleThumbnailChange}
        />
        <div
          onClick={() => thumbnailInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-tertiary-border rounded-xl overflow-hidden hover:border-brand-pixsee-secondary transition-colors cursor-pointer"
        >
          {showDetails.thumbnailPreview ? (
            <div className="relative h-40">
              <Image
                src={showDetails.thumbnailPreview}
                alt="Thumbnail"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="p-8 text-center">
              <Upload className="w-6 h-6 mx-auto mb-2 text-neutral-tertiary-text" />
              <span className="text-neutral-primary-text font-medium">
                Upload
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-primary-text mb-2">
          Title
        </label>
        <input
          type="text"
          value={showDetails.title}
          onChange={(e) =>
            setShowDetails((d) => ({ ...d, title: e.target.value }))
          }
          placeholder="Name your Show"
          className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-primary text-neutral-primary-text focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
        />
      </div>

      {/* Tix Ticker */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-primary-text mb-2">
          $Tix Ticker{" "}
          <span className="text-xs font-normal text-neutral-tertiary-text">
            (e.g. FIRE, HERO — max 5 chars, auto-generated if blank)
          </span>
        </label>
        <input
          type="text"
          value={showDetails.tickSymbol}
          onChange={(e) =>
            setShowDetails((d) => ({
              ...d,
              tickSymbol: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5),
            }))
          }
          placeholder="e.g. FIRE"
          maxLength={5}
          className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-primary text-neutral-primary-text focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary font-mono tracking-widest"
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-primary-text mb-2">
          Description
        </label>
        <textarea
          value={showDetails.description}
          onChange={(e) =>
            setShowDetails((d) => ({ ...d, description: e.target.value }))
          }
          placeholder="Tell viewers what this show is about"
          rows={4}
          className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-primary text-neutral-primary-text focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary resize-none"
        />
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-primary-text mb-2">
          Tags
        </label>
        <div className="flex items-center gap-2 flex-wrap p-3 border border-neutral-tertiary-border rounded-xl">
          <Tag className="w-4 h-4 text-neutral-tertiary-text flex-shrink-0" />
          {showDetails.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-3 py-1 bg-neutral-secondary rounded-full text-sm"
            >
              {tag}
              <button onClick={() => removeTag(tag)}>
                <X className="w-3 h-3 text-semantic-error-primary" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => {
              if (tagInput) {
                addTag(tagInput);
                setTagInput("");
              }
            }}
            placeholder="Add tag, press Enter"
            className="flex-1 min-w-[120px] outline-none text-sm bg-transparent text-neutral-primary-text placeholder:text-neutral-tertiary-text"
          />
        </div>
      </div>

      <LanguageLicenceRow />

      {/* Toggles */}
      <div className="space-y-4 mb-6">
        {(["safeForKids", "age18Plus", "embedding"] as const).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-neutral-primary-text">
              {key === "safeForKids"
                ? "Safe for Kids"
                : key === "age18Plus"
                ? "Age 18+"
                : "Embedding"}
            </span>
            <ToggleSwitch
              enabled={showDetails[key]}
              onChange={(val) => setShowDetails((d) => ({ ...d, [key]: val }))}
            />
          </div>
        ))}
      </div>

      <label className="flex items-center gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={showDetails.notifyFollowers}
          onChange={(e) =>
            setShowDetails((d) => ({ ...d, notifyFollowers: e.target.checked }))
          }
          className="w-5 h-5 rounded border-neutral-tertiary-border text-brand-pixsee-secondary focus:ring-brand-pixsee-secondary"
        />
        <span className="text-sm text-neutral-primary-text">
          Launch plan: notify followers at launch.
        </span>
      </label>

      <Button
        onClick={handleDetailsNext}
        disabled={!showDetails.title.trim()}
        className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-8 gap-2 w-full sm:w-auto disabled:opacity-60"
      >
        Next <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );

  const renderUpload = () => (
    <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
      <h2 className="text-xl font-paytone text-neutral-primary-text mb-2 text-center">
        Upload media
      </h2>
      <p className="text-neutral-tertiary-text mb-6 text-center text-sm sm:text-base">
        {contentType === "single"
          ? "Upload your video. It will remain private until you launch."
          : "Upload single or multiple episodes. Your media will remain private until you launch."}
      </p>

      {episodes.map((ep, index) => {
        const uploadState = uploadStates.find((u) => u.localId === ep.id);
        return (
          <div
            key={ep.id}
            className="mb-6 border border-neutral-tertiary-border rounded-xl p-4"
          >
            {contentType === "series" && (
              <p className="text-sm font-semibold text-neutral-primary-text mb-3">
                Episode {index + 1}
              </p>
            )}

            {/* Drop zone per episode */}
            <input
              type="file"
              accept="video/*"
              id={`file-input-${ep.id}`}
              className="hidden"
              onChange={(e) => handleVideoFileChange(e, ep.id)}
            />
            <label
              htmlFor={`file-input-${ep.id}`}
              className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4",
                uploadState?.file
                  ? "border-semantic-success-primary bg-semantic-success-subtle"
                  : "border-neutral-tertiary-border hover:border-brand-pixsee-secondary"
              )}
            >
              {uploadState?.file ? (
                <>
                  <Check className="w-6 h-6 text-semantic-success-primary mb-1" />
                  <span className="text-sm text-semantic-success-primary font-medium truncate max-w-full px-2">
                    {uploadState.file.name}
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-2 text-brand-pixsee-secondary" />
                  <span className="text-brand-pixsee-secondary font-medium">
                    Upload Video
                  </span>
                  <p className="text-sm text-neutral-tertiary-text mt-1">
                    Drag & drop or click to select
                  </p>
                </>
              )}
            </label>

            {/* Only show episode-level title/description for series */}
            {contentType === "series" && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                    Episode Title
                  </label>
                  <input
                    type="text"
                    value={ep.title}
                    onChange={(e) =>
                      updateEpisode(ep.id, { title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-primary text-neutral-primary-text focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                    Description
                  </label>
                  <textarea
                    value={ep.description}
                    onChange={(e) =>
                      updateEpisode(ep.id, { description: e.target.value })
                    }
                    placeholder="Short description"
                    rows={2}
                    className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-primary text-neutral-primary-text focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary resize-none"
                  />
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Only allow adding more episodes in series mode */}
      {contentType === "series" && (
        <div className="flex justify-end mb-6">
          <button
            onClick={addEpisode}
            className="flex items-center gap-2 text-brand-pixsee-secondary hover:underline text-sm"
          >
            Add New Episode <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {uploadStates.some((ep) => ep.file) && (
        <div className="mb-6">
          <h3 className="text-lg font-paytone text-neutral-primary-text mb-4">
            Upload Queue
          </h3>
          <UploadQueue uploadStates={uploadStates} />
        </div>
      )}

      <StepNav
        onBack={handleBack}
        onNext={handleUploadNext}
        nextLabel="Continue"
        nextDisabled={
          !uploadStates.some((ep) => ep.uploadProgress === 100 || ep.muxStatus === "ready") ||
          uploadStates.some((ep) => ep.file && ep.uploadProgress > 0 && ep.uploadProgress < 100)
        }
        isLoading={uploadStates.some((ep) => ep.file && ep.uploadProgress > 0 && ep.uploadProgress < 100)}
      />
    </div>
  );

  const renderPricing = () => (
    <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
      <h2 className="text-xl font-paytone text-neutral-primary-text mb-2">
        {contentType === "single" ? "Pricing" : "Episode Pricing"}
      </h2>
      <p className="text-neutral-tertiary-text mb-6 text-sm sm:text-base">
        {contentType === "single"
          ? "Set pricing for your video. You can always adjust before launch."
          : "Set pricing for each episode. You can always adjust before launch."}
      </p>

      <div className="block lg:hidden mb-6">
        <PricingTips />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {episodes.map((episode) => (
            <EpisodePricingCard
              key={episode.id}
              episode={episode}
              editable
              contentType={contentType}
              onUpdate={updateEpisode}
            />
          ))}
        </div>
        <div className="hidden lg:block">
          <PricingTips />
        </div>
      </div>

      <StepNav onBack={handleBack} onNext={handlePricingNext} />
    </div>
  );

  const renderReview = () => {
    const allUploaded =
      uploadStates.length > 0 &&
      uploadStates.every(
        (ep) => ep.uploadProgress === 100 || ep.muxStatus === "ready"
      );
    const anyPolling = uploadStates.some(
      (ep) =>
        ep.uploadProgress === 100 &&
        ep.muxStatus !== "ready" &&
        ep.muxStatus !== "errored"
    );

    return (
      <div className="bg-neutral-primary rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-2">
          Review
        </h2>
        <p className="text-neutral-tertiary-text mb-6 text-sm sm:text-base">
          Double-check everything before setting visibility and launching.
        </p>

        {showDetails.thumbnailPreview && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-primary-text mb-2">
              Thumbnail
            </label>
            <div className="w-full h-56 sm:h-72 rounded-xl overflow-hidden bg-neutral-tertiary relative">
              <Image
                src={showDetails.thumbnailPreview}
                alt="Thumbnail"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-primary-text mb-2">
            Title
          </label>
          <input
            type="text"
            value={showDetails.title}
            readOnly
            className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-secondary text-neutral-primary-text"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-primary-text mb-2">
            Description
          </label>
          <textarea
            value={showDetails.description || "No description"}
            readOnly
            rows={3}
            className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-secondary text-neutral-primary-text resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-primary-text mb-2">
            Tags
          </label>
          <div className="flex items-center gap-2 flex-wrap p-3 border border-neutral-tertiary-border rounded-xl">
            {showDetails.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-neutral-secondary rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
            {showDetails.tags.length === 0 && (
              <span className="text-sm text-neutral-tertiary-text">
                No tags
              </span>
            )}
          </div>
        </div>

        <LanguageLicenceRow disabled />

        <div className="space-y-4 mb-6">
          {(["safeForKids", "age18Plus", "embedding"] as const).map((key) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-neutral-primary-text">
                {key === "safeForKids"
                  ? "Safe for Kids"
                  : key === "age18Plus"
                  ? "Age 18+"
                  : "Embedding"}
              </span>
              <ToggleSwitch enabled={showDetails[key]} onChange={() => {}} />
            </div>
          ))}
        </div>

        {uploadStates.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-paytone text-neutral-primary-text mb-4">
              Upload Status
            </h3>
            <UploadQueue uploadStates={uploadStates} />
            {anyPolling && (
              <p className="flex items-center gap-2 text-sm text-neutral-tertiary-text mt-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for Mux to process your videos… this can take up to a
                minute.
              </p>
            )}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-paytone text-neutral-primary-text mb-4">
            {contentType === "single" ? "Pricing" : "Episode Pricing"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {episodes.map((episode) => (
              <EpisodePricingCard
                key={episode.id}
                episode={episode}
                contentType={contentType}
              />
            ))}
          </div>
        </div>

        <StepNav
          onBack={handleBack}
          onNext={handleReviewNext}
          nextLabel="Continue to Launch"
          isLoading={anyPolling}
          nextDisabled={!allUploaded && uploadStates.length > 0}
        />
      </div>
    );
  };

  const renderLaunch = () => (
    <div className="bg-neutral-primary rounded-2xl p-6 sm:p-8 border border-neutral-tertiary-border text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-semantic-success-subtle rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="w-8 h-8 sm:w-10 sm:h-10 text-semantic-success-primary" />
      </div>
      <h2 className="text-xl sm:text-2xl font-paytone text-neutral-primary-text mb-2">
        Ready to Launch!
      </h2>
      <p className="text-neutral-tertiary-text mb-8 text-sm sm:text-base max-w-sm mx-auto">
        Your show &ldquo;{showDetails.title}&rdquo; is ready to go live. Click
        launch to make it available to viewers.
      </p>

      {publishError && (
        <p className="text-semantic-error-primary text-sm mb-4">
          {publishError}
        </p>
      )}

      <Button
        onClick={handlePublish}
        disabled={isPublishing}
        className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto disabled:opacity-60"
      >
        {isPublishing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Publishing…
          </>
        ) : (
          "Launch Show 🚀"
        )}
      </Button>

      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          className="rounded-full px-8 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review
        </Button>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "details":
        return renderDetails();
      case "upload":
        return renderUpload();
      case "pricing":
        return renderPricing();
      case "review":
        return renderReview();
      case "launch":
        return renderLaunch();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-250 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-paytone text-neutral-primary-text">
            Create
          </h1>
          <p className="text-neutral-secondary-text mt-1 text-sm sm:text-base">
            Uploading episodes, setting pricing, and launching your show on
            Pixsee.
          </p>
        </div>

        <p className="text-sm text-neutral-tertiary-text mb-3 sm:mb-4">
          Step {currentStepIndex + 1} of {steps.length}
        </p>

        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
        />
        {renderStepContent()}
      </div>
    </div>
  );
};

//  Shared sub-components

const PricingTips = () => (
  <div className="bg-brand-tertiary rounded-xl p-4">
    <div className="flex items-center gap-2 mb-4">
      <Lightbulb className="w-5 h-5 text-semantic-warning-primary flex-shrink-0" />
      <h3 className="font-semibold text-neutral-primary-text">Pricing Tips</h3>
    </div>
    <div className="space-y-4 text-sm">
      {[
        {
          title: "Free vs Paid",
          body: "Free episodes can attract viewers and help grow your audience. Consider making the first episode free.",
        },
        // {
        //   title: "Ad revenue",
        //   body: "Episodes with ads generate additional revenue. Ad-free episodes may appeal to premium viewers.",
        // },
      ].map(({ title, body }) => (
        <div key={title}>
          <p className="font-medium text-neutral-primary-text">{title}</p>
          <p className="text-neutral-tertiary-text">{body}</p>
        </div>
      ))}
    </div>
  </div>
);

type EpisodePricingCardProps = {
  episode: Episode;
  editable?: boolean;
  contentType?: "single" | "series";
  onUpdate?: (id: string, updates: Partial<Episode>) => void;
};

const EpisodePricingCard = ({
  episode,
  editable = false,
  contentType = "series",
  onUpdate,
}: EpisodePricingCardProps) => (
  <div className="border border-neutral-tertiary-border rounded-xl p-4">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="w-[120px] sm:w-[160px] h-36 rounded-lg bg-neutral-tertiary overflow-hidden flex-shrink-0">
        {episode.previewUrl ? (
          <video
            src={episode.previewUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              v.currentTime = Math.min(v.duration * 0.1, 3);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-tertiary-text text-xs p-4 text-center">
            No preview
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        {/* Only show title/description fields for series */}
        {contentType === "series" && (
          <>
            <label className="block text-xs text-neutral-tertiary-text mb-1">
              Episode
            </label>
            <input
              type="text"
              value={episode.title}
              readOnly={!editable}
              onChange={(e) =>
                onUpdate?.(episode.id, { title: e.target.value })
              }
              className={cn(
                "w-full px-3 py-2 border border-neutral-tertiary-border rounded-lg text-sm mb-3 text-neutral-primary-text",
                editable ? "bg-neutral-primary" : "bg-neutral-secondary"
              )}
            />
            <label className="block text-xs text-neutral-tertiary-text mb-1">
              Description
            </label>
            {editable ? (
              <textarea
                value={episode.description}
                onChange={(e) =>
                  onUpdate?.(episode.id, { description: e.target.value })
                }
                rows={2}
                className="w-full min-h-[5rem] px-3 py-2 border border-neutral-tertiary-border rounded-lg text-sm resize-none mb-3 bg-neutral-primary text-neutral-primary-text"
              />
            ) : (
              <p className="text-xs text-neutral-secondary-text line-clamp-2 mb-3">
                {episode.description || "No description"}
              </p>
            )}
          </>
        )}
        <div className="flex items-center gap-2 mb-3">
          <ToggleSwitch
            enabled={episode.isPaid}
            onChange={(val) => onUpdate?.(episode.id, { isPaid: val })}
          />
          <span className="text-sm text-neutral-primary-text">Paid</span>
        </div>

        {episode.isPaid && (
          <p className="text-xs text-neutral-tertiary-text mt-2 bg-brand-pixsee-secondary/5 rounded-lg p-2">
            💡 Price is set automatically by the bonding curve — starts at
            $0.001/min and adjusts based on demand. price.
          </p>
        )}
      </div>
    </div>
  </div>
);

export default CreatePage;
