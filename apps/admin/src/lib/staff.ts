import { useEffect, useState } from "react";
import type { Staff } from "@kaundinya/config";
import { fetchStaff } from "./mockApi";

let cache: Staff[] = [];
let pending: Promise<Staff[]> | null = null;
const listeners = new Set<(staff: Staff[]) => void>();

function publish(list: Staff[]) {
  cache = list;
  listeners.forEach((listener) => listener(list));
}

export function loadStaff(): Promise<Staff[]> {
  if (!pending) {
    pending = fetchStaff()
      .then((list) => {
        publish(list);
        return list;
      })
      .catch(() => {
        pending = null;
        return cache;
      });
  }
  return pending;
}

export function invalidateStaff(): void {
  pending = null;
  void loadStaff();
}

/** Shared staff roster so dropdowns and name lookups stay in sync. */
export function useStaff(): Staff[] {
  const [staff, setStaff] = useState<Staff[]>(cache);

  useEffect(() => {
    listeners.add(setStaff);
    if (cache.length === 0) void loadStaff();
    return () => {
      listeners.delete(setStaff);
    };
  }, []);

  return staff;
}
