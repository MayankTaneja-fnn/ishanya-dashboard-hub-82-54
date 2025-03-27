
import { toast as sonnerToast, ToasterProps } from "sonner";
import { useState, useEffect } from "react";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | undefined;
};

// This interface matches what the Shadcn ui/toast expects
interface ToastApi {
  toast: (props: ToastOptions) => void;
  toasts: any[];
}

const useToast = (): ToastApi => {
  // Dummy empty array since we're not using shadcn/toast's state management
  const [toasts] = useState<any[]>([]);
  
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

  return { toast, toasts };
};

// Re-export sonner toast for direct usage
const toast = sonnerToast;

export { useToast, toast };
