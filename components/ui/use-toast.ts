"use client";

import { useState, useEffect } from "react";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
}

type Listener = (toasts: ToastMessage[]) => void;

let memoryToasts: ToastMessage[] = [];
const listeners: Listener[] = [];

export const toast = {
  success(title: string, description?: string) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, title, description, variant: "success" };
    memoryToasts = [...memoryToasts, newToast];
    listeners.forEach((l) => l(memoryToasts));

    setTimeout(() => {
      toast.dismiss(id);
    }, 4000);
  },
  error(title: string, description?: string) {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, title, description, variant: "destructive" };
    memoryToasts = [...memoryToasts, newToast];
    listeners.forEach((l) => l(memoryToasts));

    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
  },
  dismiss(id: string) {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(memoryToasts));
  },
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>(memoryToasts);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return { toasts, toast };
}
