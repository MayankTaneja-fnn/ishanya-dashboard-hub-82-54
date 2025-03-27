
import { toast as sonnerToast, Toast, ToastProps } from "sonner";
import { useState, useEffect } from "react";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | undefined;
};

const useToast = () => {
  const toast = ({ title, description, variant }: ToastOptions) => {
    if (variant === "destructive") {
      sonnerToast.error(title, {
        description: description,
      });
    } else {
      sonnerToast.success(title, {
        description: description,
      });
    }
  };

  return { toast };
};

// Re-export sonner toast for direct usage
const toast = sonnerToast;

export { useToast, toast };
