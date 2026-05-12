"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { User, Mail, Pencil, Camera, Loader2, Check } from "lucide-react";
import type { ApiProfile } from "@/app/hooks/useSocial";

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  profile: ApiProfile | null;
  updateProfile: (updates: Partial<Pick<ApiProfile, "name" | "username" | "bio">>) => Promise<boolean>;
};

const EditProfileModal = ({ isOpen, onClose, profile, updateProfile }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from profile whenever modal opens
  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name ?? "",
        username: profile.username ?? "",
        bio: profile.bio ?? "",
      });
      setSaved(false);
      setError(null);
    }
  }, [isOpen, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const ok = await updateProfile({
        name: formData.name.trim() || undefined,
        username: formData.username.trim() || undefined,
        bio: formData.bio.trim() || undefined,
      });
      if (ok) {
        setSaved(true);
        setTimeout(() => onClose(), 800);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = profile?.name ?? profile?.username ?? "User";
  const displayEmail = profile?.email ?? "";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg sm:max-w-xl w-[95vw] max-h-[92vh]"
    >
      <div className="p-5 sm:p-6 overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-paytone text-neutral-primary-text mb-5 sm:mb-6">
          Edit Profile
        </h2>

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-6 pb-6 border-b border-neutral-tertiary-border">
          <div className="relative mx-auto sm:mx-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-tertiary overflow-hidden flex items-center justify-center text-3xl font-bold text-neutral-secondary-text">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-inverse-primary text-white flex items-center justify-center border-2 border-white">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center sm:text-left flex-1">
            <p className="font-semibold text-neutral-primary-text text-lg">
              {displayName}
            </p>
            {displayEmail && (
              <p className="text-sm text-neutral-tertiary-text flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                {displayEmail}
              </p>
            )}
          </div>

          <button className="hidden sm:block p-2 hover:bg-neutral-secondary rounded-lg transition-colors">
            <Pencil className="w-5 h-5 text-neutral-tertiary-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
              Display Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your display name"
                className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary bg-neutral-primary text-neutral-primary-text text-base"
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary-text pointer-events-none" />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="@username"
              className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary bg-neutral-primary text-neutral-primary-text text-base"
            />
          </div>

          {/* Email — read-only, managed by auth provider */}
          {displayEmail && (
            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
                Email <span className="text-xs text-neutral-tertiary-text font-normal">(managed by auth provider)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={displayEmail}
                  readOnly
                  className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl bg-neutral-secondary text-neutral-tertiary-text text-base cursor-not-allowed"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary-text pointer-events-none" />
              </div>
            </div>
          )}

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
              className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary resize-none bg-neutral-primary text-neutral-primary-text text-base"
            />
          </div>

          {error && (
            <p className="text-sm text-semantic-error-primary">{error}</p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <Button
              type="submit"
              disabled={isSaving || saved}
              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg px-6 py-3 sm:py-6 text-base flex-1 sm:flex-none gap-2 disabled:opacity-70"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : saved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : (
                "Update settings"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="bg-semantic-error-primary hover:bg-semantic-error-text text-white border-0 rounded-lg px-6 py-3 sm:py-6 text-base flex-1 sm:flex-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProfileModal;
