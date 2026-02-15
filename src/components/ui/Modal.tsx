"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className={cn(
          "relative bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-xl mx-4",
          className
        )}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-neutral-secondary transition-colors z-10"
        >
          <X className="w-5 h-5 text-neutral-tertiary-text" />
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
