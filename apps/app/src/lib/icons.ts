import {
  Building2,
  ShieldCheck,
  Wrench,
  Coins,
  type LucideIcon,
} from "lucide-react";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  Building2,
  ShieldCheck,
  Wrench,
  Coins,
};

export function getServiceIcon(name: string): LucideIcon {
  return SERVICE_ICONS[name] ?? Wrench;
}
