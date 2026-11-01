export type ToastTone = "success" | "error";

export type ToastDetail = {
  id: string;
  message: string;
  tone: ToastTone;
};

export function showToast(message: string, tone: ToastTone = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastDetail>("kaundinya:toast", {
      detail: { id: crypto.randomUUID(), message, tone },
    }),
  );
}
