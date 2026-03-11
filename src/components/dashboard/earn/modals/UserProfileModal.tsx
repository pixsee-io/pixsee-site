"use client";

import React from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

type UserProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    avatarUrl: string;
    rank: number | string;
    followers: string;
    points: string;
  };
};

const UserProfileModal = ({ isOpen, onClose, user }: UserProfileModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <h2 className="text-xl font-paytone text-neutral-primary-text text-center mb-8">
          Users Profile
        </h2>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-orange-100">
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={112}
              height={112}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name */}
        <h3 className="text-xl font-semibold text-neutral-primary-text text-center mb-8">
          {user.name}
        </h3>

        {/* Stats */}
        <div>
          <h4 className="text-lg font-paytone text-neutral-primary-text mb-4">
            Users Stats
          </h4>
          <div className="bg-brand-pixsee-tertiary rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-neutral-tertiary-text mb-1">Rank</p>
                <div className="inline-flex items-center justify-center px-3 py-1 border border-brand-pixsee-secondary rounded-full">
                  <span className="text-brand-pixsee-secondary font-semibold">
                    {typeof user.rank === "number"
                      ? `${user.rank}${getOrdinalSuffix(user.rank)}`
                      : user.rank}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-tertiary-text mb-1">
                  Followers
                </p>
                <p className="text-brand-pixsee-secondary font-semibold text-lg">
                  {user.followers}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-tertiary-text mb-1">
                  Points
                </p>
                <p className="text-brand-pixsee-secondary font-semibold text-lg">
                  {user.points}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Helper function to get ordinal suffix
function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export default UserProfileModal;
