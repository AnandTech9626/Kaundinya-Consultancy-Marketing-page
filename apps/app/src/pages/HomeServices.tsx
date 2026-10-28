import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Ruler,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Badge, Card, Skeleton } from "@kaundinya/ui";
import { COMPLIANCE, SERVICE_CATALOG } from "@kaundinya/config";
import type { ServiceCatalogItem } from "@kaundinya/config";
import { fetchJobs } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";

const GROUPS = [
  { id: "all", label: "All services" },
  { id: "nets", label: "Nets & Grills" },
  { id: "appliance", label: "Appliance" },
  { id: "electrical", label: "Electrical & Plumbing" },
  { id: "interiors", label: "Interiors" },
  { id: "docs", label: "Docs & Printouts" },
];

function groupOf(item: ServiceCatalogItem) {
  if (item.id === "hs-nets" || item.id === "hs-grills") return "nets";
  if (item.id === "hs-ac") return "appliance";
  if (item.id === "hs-electrical") return "electrical";
  if (item.id === "hs-interiors") return "interiors";
  return "docs";
}

function pricingLabel(item: ServiceCatalogItem) {
  if (!item.pricing) return "Custom quote";
  const { model, amount, unit } = item.pricing;
  if (model === "per-sqft" && amount) return `₹${amount}/${unit}`;
  if (model === "fixed") return amount === 0 ? "Free" : `₹${amount}${unit ? `/${unit}` : ""}`;
  if (model === "from" && amount) return `From ₹${amount}`;
  return "Custom quote";
}

function serviceHref(item: ServiceCatalogItem) {
  if (item.id === "hs-documents") return "/home-services/documents";
  if (item.id === "hs-printouts") return "/home-services/printouts";
  if (item.id === "hs-interiors") return "/home-services/interiors";
  return `/home-services/${item.id}`;
}

const JOB_STEPS = [
  "Requested",
  "Assigned",
  "En Route",
  "In Progress",
  "Completed",
];

export function HomeServices() {
  const [group, setGroup] = useState("all");
  const { data: jobs, loading } = useAsync(fetchJobs);

  const catalog = useMemo(
    () =>
      SERVICE_CATALOG.filter(
        (item) => item.categoryId === "property-home-services"
      ),
    []
  );

  const filtered =
    group === "all" ? catalog : catalog.filter((item) => groupOf(item) === group);
  const activeJob = (jobs ?? []).find((job) =>
    ["requested", "assigned", "en_route", "in_progress"].includes(job.status)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
            Home Services
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Home help, vetted and tracked
          </h1>
          <p className="text-muted mt-1 max-w-2xl">
            Nets, grills, appliance care, electrical work, interiors and civic documents —
            with free measurement and a live job tracker.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/home-services/measurement"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold transition-colors"
          >
            <Ruler className="w-4 h-4" />
            Book free measurement
          </Link>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-border-subtle hover:border-gold/60 text-charcoal text-sm font-bold transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            My jobs
          </Link>
        </div>
      </div>

      {activeJob && (
        <Link to={`/jobs/${activeJob.id}`} className="block">
          <Card hoverable className="p-4 sm:p-5 border-gold/40 bg-gold-light/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-[#B8860B] flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#8a6b1a]">
                    Active job
                  </p>
                  <p className="text-sm font-extrabold text-charcoal">
                    {activeJob.serviceName}
                  </p>
                  <p className="text-xs text-muted">
                    {activeJob.technician ?? "Technician being assigned"}
                    {activeJob.scheduledAt ? ` · ${activeJob.scheduledAt}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info">{activeJob.status.replace("_", " ")}</Badge>
                <ArrowRight className="w-4 h-4 text-gold" />
              </div>
            </div>
          </Card>
        </Link>
      )}

      <div className="flex flex-wrap gap-2">
        {GROUPS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setGroup(option.id)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              group === option.id
                ? "bg-charcoal text-white"
                : "bg-white text-charcoal border border-border-subtle hover:border-muted"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="p-5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Link key={item.id} to={serviceHref(item)} className="block">
              <Card hoverable className="p-5 h-full flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <Badge variant={item.pricing?.model === "per-sqft" ? "gold" : "neutral"}>
                    {pricingLabel(item)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-charcoal">{item.name}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.summary}</p>
                </div>
                {item.highlights && (
                  <ul className="space-y-1">
                    {item.highlights.slice(0, 2).map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-1.5 text-[11px] text-charcoal-light"
                      >
                        <Sparkles className="w-3 h-3 text-gold shrink-0 mt-0.5" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto pt-1 flex items-center justify-between text-xs font-bold text-gold">
                  {item.pricing?.model === "per-sqft" ? "Free measurement" : "View & book"}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Card className="p-5">
        <h2 className="text-sm font-extrabold text-charcoal mb-3">How a job runs</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {JOB_STEPS.map((step, index) => (
            <div key={step} className="rounded-xl bg-ivory px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
                Step {index + 1}
              </p>
              <p className="text-xs font-bold text-charcoal mt-0.5">{step}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-3">
          You share a Start-Job OTP with the technician and rate the work after completion.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Link to="/home-services/documents" className="block lg:col-span-1">
          <Card hoverable className="p-5 h-full space-y-2">
            <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-charcoal">Secure document portal</h3>
            <p className="text-xs text-muted leading-relaxed">
              Aadhaar and voter ID updates with watermarked uploads.
            </p>
          </Card>
        </Link>
        <Link to="/home-services/printouts" className="block lg:col-span-1">
          <Card hoverable className="p-5 h-full space-y-2">
            <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-charcoal">Printouts</h3>
            <p className="text-xs text-muted leading-relaxed">
              Upload a PDF, see live pricing, files auto-delete after printing.
            </p>
          </Card>
        </Link>
        <Link to="/home-services/interiors" className="block lg:col-span-1">
          <Card hoverable className="p-5 h-full space-y-2">
            <div className="w-9 h-9 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-charcoal">Interiors</h3>
            <p className="text-xs text-muted leading-relaxed">
              Portfolio walkthrough and a free initial design consultation.
            </p>
          </Card>
        </Link>
      </div>

      <Card className="p-4 bg-ivory/60">
        <p className="text-[11px] font-bold text-charcoal">{COMPLIANCE.labour.label}</p>
        <p className="text-[11px] text-muted leading-relaxed mt-1">
          {COMPLIANCE.labour.note}
        </p>
      </Card>
    </div>
  );
}
