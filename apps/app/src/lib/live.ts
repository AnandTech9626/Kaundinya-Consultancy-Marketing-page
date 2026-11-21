type LiveListener = () => void;

const listeners = new Set<LiveListener>();
let timer: ReturnType<typeof setTimeout> | null = null;

/** Notifies every subscribed screen that server data may have changed. */
export function bumpLiveData() {
  if (typeof window === "undefined") return;
  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    for (const listener of listeners) listener();
  }, 500);
}

export function subscribeLiveData(listener: LiveListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
