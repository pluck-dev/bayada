"use client";

import * as React from "react";

import { cn } from "../lib/cn";

interface ModalContextValue {
  open: boolean;
  onClose: () => void;
}

const ModalContext = React.createContext<ModalContextValue>({
  open: false,
  onClose: () => {},
});

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <ModalContext.Provider value={{ open, onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative z-10">{children}</div>
      </div>
    </ModalContext.Provider>
  );
}

export function ModalContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full max-w-lg rounded-xl bg-[color:var(--bg)] p-6 shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ModalHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function ModalTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold text-[color:var(--fg)]",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function ModalClose({ className }: { className?: string }) {
  const { onClose } = React.useContext(ModalContext);
  return (
    <button
      onClick={onClose}
      className={cn(
        "rounded-md p-1 text-[color:var(--muted)] hover:text-[color:var(--fg)]",
        className
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M4 4L12 12M12 4L4 12" />
      </svg>
    </button>
  );
}

export function ModalFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mt-6 flex items-center justify-end gap-3", className)}>
      {children}
    </div>
  );
}
