"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import Image from "next/image";

// Types
type StepId = "details" | "upload" | "pricing" | "review" | "launch";

type Episode = {
  id: string;
  title: string;
  description: string;
  fileName?: string;
  fileSize?: string;
  progress: number;
  isPaid: boolean;
  price: string;
};

type ShowDetails = {
  thumbnail: string | null;
  title: string;
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
  {
    id: "1",
    title: "Episode 1: First Contact",
    description:
      "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
    fileName: "Episode-1.mp4",
    fileSize: "1.2 GB",
    progress: 100,
    isPaid: true,
    price: "",
  },
  {
    id: "2",
    title: "Episode 2: First Contact",
    description:
      "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
    fileName: "Episode-2.mp4",
    fileSize: "1.2 GB",
    progress: 100,
    isPaid: true,
    price: "",
  },
  {
    id: "3",
    title: "Episode 3: First Contact",
    description:
      "Dr. Maya Foster receives an encrypted transmission that changes everything she thought she knew about our place in the universe.",
    fileName: "Episode-3.mp4",
    fileSize: "1.2 GB",
    progress: 100,
    isPaid: true,
    price: "",
  },
];

// Toggle Switch Component
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

// Step Indicator Component
// Mobile: icon-only dots with a progress bar. sm+: full pill labels.
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
      {/* ── Mobile step indicator (< sm) ── */}
      <div className="flex sm:hidden items-center mb-6">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              {/* Dot */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 transition-all",
                  isCompleted
                    ? "bg-brand-primary text-white"
                    : isCurrent
                    ? "bg-brand-primary text-white ring-4 ring-brand-primary/20"
                    : "bg-white border border-black/20 text-neutral-tertiary-text"
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.number}
              </div>
              {/* Connector */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-px mx-1",
                    index < currentIndex ? "bg-brand-primary" : "bg-black/15"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Desktop step indicator (sm+) ── */}
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
                      : "bg-white border border-black/30 text-neutral-secondary-text"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs text-black",
                        isCurrent ? "bg-white" : "bg-black/50 text-white"
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
                    isPast || isCompleted ? "bg-brand-primary" : "bg-black"
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

// Upload Queue Component
const UploadQueue = ({ episodes }: { episodes: Episode[] }) => (
  <div className="bg-brand-pixsee-tertiary rounded-xl p-4 space-y-4">
    {episodes
      .filter((ep) => ep.fileName)
      .map((episode) => (
        <div key={episode.id}>
          <div className="flex items-center justify-between mb-1 gap-2">
            <div className="min-w-0">
              <p className="font-medium text-neutral-primary-text truncate">
                {episode.fileName}
              </p>
              <p className="text-sm text-neutral-tertiary-text">
                {episode.fileSize} · Completed
              </p>
            </div>
            <span className="text-sm text-neutral-tertiary-text flex-shrink-0">
              {episode.progress}%
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-semantic-success-primary rounded-full"
              style={{ width: `${episode.progress}%` }}
            />
          </div>
        </div>
      ))}
  </div>
);

// Shared nav footer used across multiple steps
const StepNav = ({
  onBack,
  onNext,
  nextLabel = "Next",
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
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
        className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-6 sm:px-12 gap-2 flex-1 sm:flex-none"
      >
        {nextLabel}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
    <p className="flex items-center gap-2 text-sm text-semantic-error-primary mt-4">
      <Info className="w-4 h-4 flex-shrink-0" />
      You can edit everything later in Studio before making it public.
    </p>
  </>
);

const CreatePage = () => {
  const [currentStep, setCurrentStep] = useState<StepId>("details");
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>(initialEpisodes);
  const [showDetails, setShowDetails] = useState<ShowDetails>({
    thumbnail: null,
    title: "The Journey",
    description: "",
    tags: ["Action", "Drama"],
    language: "English",
    licence: "Pixsee (Default)",
    safeForKids: true,
    age18Plus: false,
    embedding: false,
    notifyFollowers: true,
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setShowDetails({
      ...showDetails,
      tags: showDetails.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const updateEpisode = (id: string, updates: Partial<Episode>) => {
    setEpisodes(
      episodes.map((ep) => (ep.id === id ? { ...ep, ...updates } : ep))
    );
  };

  // Shared Language + Licence row — wraps on mobile
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
            setShowDetails({ ...showDetails, language: e.target.value })
          }
          className="flex-1 sm:flex-none px-3 py-2 border border-neutral-tertiary-border rounded-lg text-sm disabled:bg-neutral-secondary"
        >
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-primary-text w-16 sm:w-auto">
          Licence
        </span>
        <select
          value={showDetails.licence}
          disabled={disabled}
          onChange={(e) =>
            setShowDetails({ ...showDetails, licence: e.target.value })
          }
          className="flex-1 sm:flex-none px-3 py-2 border border-neutral-tertiary-border rounded-lg text-sm disabled:bg-neutral-secondary"
        >
          <option>Pixsee (Default)</option>
          <option>Creative Commons</option>
        </select>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      // ─────────────────────────────────────────
      case "details":
        return (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-2">
              Watch Details
            </h2>
            <p className="text-neutral-tertiary-text mb-6">
              Describe your show so viewers and algorithms can find it.
            </p>

            {/* Thumbnail */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Upload Thumbnail
              </label>
              <div className="border-2 border-dashed border-neutral-tertiary-border rounded-xl p-8 text-center hover:border-brand-pixsee-secondary transition-colors cursor-pointer">
                <Upload className="w-6 h-6 mx-auto mb-2 text-neutral-tertiary-text" />
                <span className="text-neutral-primary-text font-medium">
                  Upload
                </span>
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
                  setShowDetails({ ...showDetails, title: e.target.value })
                }
                placeholder="Name your Show"
                className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
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
                  setShowDetails({
                    ...showDetails,
                    description: e.target.value,
                  })
                }
                placeholder="Tell viewers what this show is about"
                rows={4}
                className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary resize-none"
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
                  placeholder="Sci-fi, Thriller, Comedy,"
                  className="flex-1 min-w-[120px] outline-none text-sm"
                />
              </div>
            </div>

            <LanguageLicenceRow />

            {/* Toggles */}
            <div className="space-y-4 mb-6">
              {[
                {
                  label: "Safe for Kids",
                  key: "safeForKids" as const,
                },
                { label: "Age 18+", key: "age18Plus" as const },
                { label: "Embedding", key: "embedding" as const },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-primary-text">
                    {label}
                  </span>
                  <ToggleSwitch
                    enabled={showDetails[key]}
                    onChange={(val) =>
                      setShowDetails({ ...showDetails, [key]: val })
                    }
                  />
                </div>
              ))}
            </div>

            {/* Notify */}
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={showDetails.notifyFollowers}
                onChange={(e) =>
                  setShowDetails({
                    ...showDetails,
                    notifyFollowers: e.target.checked,
                  })
                }
                className="w-5 h-5 rounded border-neutral-tertiary-border text-brand-pixsee-secondary focus:ring-brand-pixsee-secondary"
              />
              <span className="text-sm text-neutral-primary-text">
                Launch plan: notify followers at launch.
              </span>
            </label>

            <Button
              onClick={handleNext}
              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-8 gap-2 w-full sm:w-auto"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        );

      // ─────────────────────────────────────────
      case "upload":
        return (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-2 text-center">
              Upload media
            </h2>
            <p className="text-neutral-tertiary-text mb-6 text-center text-sm sm:text-base">
              Upload single or multiple episodes. Your media will remain private
              until you launch.
            </p>

            {/* Drop Zone */}
            <div className="border-2 border-dashed border-neutral-tertiary-border rounded-xl p-6 sm:p-8 text-center mb-6 hover:border-brand-pixsee-secondary transition-colors cursor-pointer">
              <Upload className="w-6 h-6 mx-auto mb-2 text-brand-pixsee-secondary" />
              <span className="text-brand-pixsee-secondary font-medium">
                Upload Videos
              </span>
              <p className="text-sm text-neutral-tertiary-text mt-1">
                Drag & drop files here or click "Upload Videos".
              </p>
            </div>

            {/* Episode Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Episode Title
              </label>
              <input
                type="text"
                placeholder="Episode 1"
                className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Description
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 w-4 h-4 text-neutral-tertiary-text" />
                <textarea
                  placeholder="Short Description"
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary resize-none"
                />
              </div>
            </div>

            {/* Add Episode */}
            <div className="flex justify-end mb-6">
              <button className="flex items-center gap-2 text-brand-pixsee-secondary hover:underline text-sm">
                Add New Episode
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Queue */}
            <div className="mb-6">
              <h3 className="text-lg font-paytone text-neutral-primary-text mb-4">
                Upload Queue
              </h3>
              <UploadQueue episodes={episodes} />
            </div>

            <StepNav onBack={handleBack} onNext={handleNext} />
          </div>
        );

      case "pricing":
        return (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-2">
              Episode Pricing
            </h2>
            <p className="text-neutral-tertiary-text mb-6 text-sm sm:text-base">
              Set pricing for each episode. You can always adjust before launch.
            </p>

            {/* Pricing Tips moves above episodes on mobile */}
            <div className="block lg:hidden mb-6">
              <PricingTips />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Episode Cards */}
              <div className="lg:col-span-2 space-y-4">
                {episodes.map((episode) => (
                  <EpisodePricingCard
                    key={episode.id}
                    episode={episode}
                    editable
                    onUpdate={updateEpisode}
                  />
                ))}
              </div>

              {/* Pricing Tips sidebar — desktop only */}
              <div className="hidden lg:block">
                <PricingTips />
              </div>
            </div>

            <StepNav onBack={handleBack} onNext={handleNext} />
          </div>
        );

      // ─────────────────────────────────────────
      case "review":
        return (
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-neutral-tertiary-border">
            <h2 className="text-xl font-paytone text-neutral-primary-text mb-2">
              Review
            </h2>
            <p className="text-neutral-tertiary-text mb-6 text-sm sm:text-base">
              Double-check everything before setting visibility and launching.
            </p>

            {/* Thumbnail Preview */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Upload Thumbnail
              </label>

              <div className="w-full h-40 sm:h-48 rounded-xl overflow-hidden bg-neutral-tertiary">
                <Image
                  src={"/images/episode-pricing.png"}
                  alt="episode1"
                  width={200}
                  height={200}
                  unoptimized
                  className="w-full h-full sm:h-48 object-cover "
                />
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Title
              </label>
              <input
                type="text"
                value={showDetails.title}
                readOnly
                className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-secondary"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Description
              </label>
              <textarea
                value={
                  showDetails.description ||
                  "Tell viewers what this show is about"
                }
                readOnly
                rows={3}
                className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-secondary resize-none"
              />
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Tags
              </label>
              <div className="flex items-center gap-2 flex-wrap p-3 border border-neutral-tertiary-border rounded-xl">
                {showDetails.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 bg-neutral-secondary rounded-full text-sm"
                  >
                    {tag}
                    <X className="w-3 h-3 text-semantic-error-primary" />
                  </span>
                ))}
              </div>
            </div>

            <LanguageLicenceRow disabled />

            {/* Toggles */}
            <div className="space-y-4 mb-6">
              {[
                { label: "Safe for Kids", key: "safeForKids" as const },
                { label: "Age 18+", key: "age18Plus" as const },
                { label: "Embedding", key: "embedding" as const },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-primary-text">
                    {label}
                  </span>
                  <ToggleSwitch
                    enabled={showDetails[key]}
                    onChange={() => {}}
                  />
                </div>
              ))}
            </div>

            {/* Notify */}
            <label className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                checked={showDetails.notifyFollowers}
                readOnly
                className="w-5 h-5 rounded border-neutral-tertiary-border text-brand-pixsee-secondary"
              />
              <span className="text-sm text-neutral-primary-text">
                Launch plan: notify followers at launch.
              </span>
            </label>

            {/* Upload Queue */}
            <div className="mb-6">
              <h3 className="text-lg font-paytone text-neutral-primary-text mb-4">
                Upload Queue
              </h3>
              <UploadQueue episodes={episodes} />
            </div>

            {/* Episode Pricing Review */}
            <div className="mb-6">
              <h3 className="text-lg font-paytone text-neutral-primary-text mb-4">
                Episode Pricing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {episodes.map((episode) => (
                  <EpisodePricingCard key={episode.id} episode={episode} />
                ))}
              </div>
            </div>

            <StepNav onBack={handleBack} onNext={handleNext} />
          </div>
        );

      // ─────────────────────────────────────────
      case "launch":
        return (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-tertiary-border text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-semantic-success-subtle rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-semantic-success-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-paytone text-neutral-primary-text mb-2">
              Ready to Launch!
            </h2>
            <p className="text-neutral-tertiary-text mb-8 text-sm sm:text-base max-w-sm mx-auto">
              Your show "{showDetails.title}" is ready to go live. Click launch
              to make it available to viewers.
            </p>

            <Button className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-full px-10 sm:px-12 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto">
              Launch Show 🚀
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

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-foundation-alternate pb-12">
      <div className="max-w-250 mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-paytone text-neutral-primary-text">
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

// ─── Extracted shared sub-components ────────────────────────────────────────

const PricingTips = () => (
  <div className="bg-brand-tertiary rounded-xl p-4">
    <div className="flex items-center gap-2 mb-4">
      <Lightbulb className="w-5 h-5 text-semantic-warning-primary flex-shrink-0" />
      <h3 className="font-semibold text-neutral-primary-text">Pricing Tips</h3>
    </div>
    <div className="space-y-4 text-sm">
      {[
        {
          title: "Start with competitive pricing",
          body: "Research similar shows and price competitively. You can always adjust pricing later.",
        },
        {
          title: "Free vs Paid",
          body: "Free episodes can attract viewers and help grow your audience. Consider making the first episode free.",
        },
        {
          title: "Ad revenue",
          body: "Episodes with ads generate additional revenue. Ad-free episodes may appeal to premium viewers willing to pay more.",
        },
        {
          title: "Binge pricing",
          body: "Consider offering discounts for viewers who purchase multiple episodes at once.",
        },
      ].map(({ title, body }) => (
        <div key={title}>
          <p className="font-medium text-neutral-primary-text">{title}</p>
          <p className="text-neutral-tertiary-text">{body}</p>
        </div>
      ))}
    </div>
  </div>
);

const EpisodePricingCard = ({
  episode,
  editable = false,
  onUpdate,
}: {
  episode: Episode;
  editable?: boolean;
  onUpdate?: (id: string, updates: Partial<Episode>) => void;
}) => (
  <div className="border border-neutral-tertiary-border rounded-xl p-4">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="max-h-44 rounded-lg bg-neutral-tertiary overflow-hidden">
        <Image
          src={"/images/episode-pricing.png"}
          alt="episode1"
          width={200}
          height={200}
          className="w-auto h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <label className="block text-xs text-neutral-tertiary-text mb-1">
          Episode
        </label>
        <input
          type="text"
          value={episode.title}
          readOnly={!editable}
          onChange={(e) => onUpdate?.(episode.id, { title: e.target.value })}
          className={cn(
            "w-full px-3 py-2 border border-neutral-tertiary-border rounded-lg text-sm mb-3",
            !editable && "bg-neutral-secondary"
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
            className="w-full min-h-[5rem] px-3 py-2 border border-neutral-tertiary-border rounded-lg text-sm resize-none mb-3"
          />
        ) : (
          <p className="text-xs text-neutral-secondary-text line-clamp-2 mb-3">
            {episode.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
          <ToggleSwitch
            enabled={episode.isPaid}
            onChange={(val) => onUpdate?.(episode.id, { isPaid: val })}
          />
          <span className="text-sm text-neutral-primary-text">Paid</span>
        </div>

        <label className="block text-xs text-neutral-tertiary-text mb-1">
          Price per episode
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-tertiary-text text-sm">
            $
          </span>
          <input
            type="text"
            value={editable ? episode.price : episode.price || "$"}
            readOnly={!editable}
            onChange={(e) => onUpdate?.(episode.id, { price: e.target.value })}
            className={cn(
              "w-full pl-8 pr-4 py-2 border border-neutral-tertiary-border rounded-lg text-sm",
              !editable && "bg-neutral-secondary"
            )}
          />
        </div>
      </div>
    </div>
  </div>
);

export default CreatePage;
