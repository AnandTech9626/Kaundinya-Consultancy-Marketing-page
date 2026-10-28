import { Building2, ShieldCheck, Wrench, Coins, type LucideIcon } from "lucide-react";
import { Card } from "@kaundinya/ui";
import { SERVICE_CATEGORIES } from "@kaundinya/config";

const ICONS: Record<string, LucideIcon> = {
  Building2,
  ShieldCheck,
  Wrench,
  Coins,
};

export function Services() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Services
        </h1>
        <p className="text-muted mt-1">
          Service catalogue (shared with the marketing and client apps).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICE_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] ?? Wrench;
          return (
            <Card key={cat.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-charcoal leading-snug">{cat.name}</h2>
                  <p className="text-xs text-muted leading-relaxed">{cat.tagline}</p>
                </div>
              </div>
              <div className="mt-4 border-t border-border-subtle pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                  {cat.services.length} sub-services
                </p>
                <ul className="space-y-1.5">
                  {cat.services.map((s) => (
                    <li key={s} className="flex items-start gap-1.5 text-xs text-charcoal-light">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                      <span className="leading-snug">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
