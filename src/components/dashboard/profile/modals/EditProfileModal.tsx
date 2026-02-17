"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/Modal";
import { User, Mail, Pencil, Camera } from "lucide-react";

type EditProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Micheal",
    username: "Male",
    email: "johndoe@gmail.com",
    bio: "",
    discord: "",
    twitter: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    onClose();
  };

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
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-neutral-tertiary overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl">
                👤
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-inverse-primary text-white flex items-center justify-center border-2 border-white">
              <Camera className="w-4 h-4 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="text-center sm:text-left flex-1">
            <p className="font-semibold text-neutral-primary-text text-lg">
              John Doe
            </p>
            <p className="text-sm text-neutral-tertiary-text flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5" />
              johndoe@gmail.com
            </p>
            <button className="text-sm text-brand-pixsee-secondary hover:underline mt-2 sm:mt-1 block mx-auto sm:mx-0">
              Change Image
            </button>
          </div>

          <button className="hidden sm:block p-2 hover:bg-neutral-secondary rounded-lg transition-colors">
            <Pencil className="w-5 h-5 text-neutral-tertiary-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary text-base"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary-text pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary text-base"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary-text pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Username and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary text-base"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary-text pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-neutral-primary-text mb-1.5 sm:mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="tell us about yourself"
              rows={4}
              className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary resize-none text-base"
            />
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-primary-text mb-3 sm:mb-4">
              Social Links
            </h3>

            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm text-neutral-tertiary-text mb-1.5 sm:mb-2">
                  Discord
                </label>
                <input
                  type="text"
                  name="discord"
                  value={formData.discord}
                  onChange={handleChange}
                  placeholder="https://discord.com/yourusername"
                  className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-tertiary-text mb-1.5 sm:mb-2">
                  X / Twitter
                </label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https://x.com/yourusername"
                  className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-5 sm:pt-6">
            <Button
              type="submit"
              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg px-6 py-3 sm:py-6 text-base flex-1 sm:flex-none"
            >
              Update settings
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
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
