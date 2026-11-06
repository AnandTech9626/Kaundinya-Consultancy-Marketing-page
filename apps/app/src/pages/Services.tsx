import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Card } from "@kaundinya/ui";
import { SERVICE_CATEGORIES, type ServiceCategory } from "@kaundinya/config";
import { getServiceIcon } from "../lib/icons";

function ServicePanel({
  category,
  index,
}: {
  category: ServiceCategory;
  index: number;
}) {
  const Icon = getServiceIcon(category.icon);

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-4 right-0 text-[6rem] font-black leading-none text-brand/10"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {category.name}
            </h2>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand mt-0.5">
              {category.tagline}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>

        <div className="border-t border-border pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
            What we offer
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {category.services.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-foreground-soft">
                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                <span className="leading-snug">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to={`/services/${category.slug}`}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-muted text-on-brand text-sm font-bold shadow-md transition-colors"
        >
          Explore this Service
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export function Services() {
  const [activeId, setActiveId] = useState(SERVICE_CATEGORIES[0].id);
  const [openId, setOpenId] = useState<string | null>(SERVICE_CATEGORIES[0].id);

  const activeIndex = Math.max(
    0,
    SERVICE_CATEGORIES.findIndex((c) => c.id === activeId)
  );
  const active = SERVICE_CATEGORIES[activeIndex];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Request a Service
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose a category below to explore and request tailored assistance.
        </p>
      </div>

      {/* Desktop: master-detail split */}
      <div className="hidden lg:grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-2" role="tablist" aria-label="Service categories">
          {SERVICE_CATEGORIES.map((cat, i) => {
            const Icon = getServiceIcon(cat.icon);
            const isActive = cat.id === activeId;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onMouseEnter={() => setActiveId(cat.id)}
                onFocus={() => setActiveId(cat.id)}
                onClick={() => setActiveId(cat.id)}
                className={`w-full text-left flex items-center gap-3 rounded-xl border p-4 transition-all cursor-pointer ${
                  isActive
                    ? "bg-surface border-border border-l-4 border-l-gold shadow-sm"
                    : "bg-transparent border-transparent hover:bg-surface/70"
                }`}
              >
                <span
                  className={`text-sm font-black tabular-nums ${
                    isActive ? "text-brand" : "text-subtle-foreground"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? "bg-brand-soft text-brand-strong" : "bg-surface text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-sm font-bold leading-snug ${
                      isActive ? "text-foreground" : "text-foreground-soft"
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground truncate">{cat.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="col-span-7">
          <Card className="p-6 lg:p-8 h-full overflow-hidden">
            <ServicePanel category={active} index={activeIndex} />
          </Card>
        </div>
      </div>

      {/* Mobile: accordion */}
      <div className="lg:hidden space-y-3">
        {SERVICE_CATEGORIES.map((cat, i) => {
          const Icon = getServiceIcon(cat.icon);
          const isOpen = openId === cat.id;
          return (
            <div
              key={cat.id}
              className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : cat.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
              >
                <span className="text-sm font-black tabular-nums text-subtle-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="w-10 h-10 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0 block text-sm font-bold text-foreground leading-snug">
                  {cat.name}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 pt-1 border-t border-border">
                  <ServicePanel category={cat} index={i} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
