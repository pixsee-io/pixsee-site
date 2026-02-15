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
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <div className="p-6">
        <h2 className="text-xl font-paytone text-neutral-primary-text mb-6">
          Edit Profile
        </h2>

        {/* Avatar Section */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-tertiary-border">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-neutral-tertiary overflow-hidden">
              <div className="w-full h-full flex items-center justify-center text-2xl">
                👤
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-neutral-inverse-primary text-white flex items-center justify-center">
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <p className="font-semibold text-neutral-primary-text">John Doe</p>
            <p className="text-sm text-neutral-tertiary-text flex items-center gap-1">
              <Camera className="w-3 h-3" />
              johndoe@gmail.com
            </p>
            <button className="text-sm text-brand-pixsee-secondary hover:underline mt-1">
              Change Image
            </button>
          </div>
          <button className="ml-auto p-2 hover:bg-neutral-secondary rounded-lg transition-colors">
            <Pencil className="w-4 h-4 text-neutral-tertiary-text" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary-text" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary-text" />
              </div>
            </div>
          </div>

          {/* Username and Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-primary-text mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary"
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-tertiary-text" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-neutral-primary-text mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="tell us about yourself"
              rows={4}
              className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary resize-none"
            />
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-primary-text mb-4">
              Social Links
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-tertiary-text mb-2">
                  Discord
                </label>
                <input
                  type="text"
                  name="discord"
                  value={formData.discord}
                  onChange={handleChange}
                  placeholder="https:// Discord.com/your username"
                  className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-neutral-tertiary-text mb-2">
                  X
                </label>
                <input
                  type="text"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleChange}
                  placeholder="https:// x.com/your username"
                  className="w-full px-4 py-3 border border-neutral-tertiary-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-pixsee-secondary text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="bg-brand-pixsee-secondary hover:bg-brand-pixsee-hover text-white rounded-lg px-6"
            >
              Update settings
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-semantic-error-primary hover:bg-semantic-error-text text-white border-0 rounded-lg px-6"
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
