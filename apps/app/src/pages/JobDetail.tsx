import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  Phone,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Skeleton,
  StatusTimeline,
  Textarea,
} from "@kaundinya/ui";
import type { BadgeVariant } from "@kaundinya/ui";
import { MODULE_STAGES } from "@kaundinya/config";
import { fetchJob, rateJob, requestJobStartOtp } from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { formatDate, formatINR } from "../lib/formats";

const STAGES = MODULE_STAGES["property-home-services"];

const JOB_BADGE: Record<string, BadgeVariant> = {
  requested: "gold",
  assigned: "info",
  en_route: "warning",
  in_progress: "info",
  completed: "success",
  cancelled: "danger",
};

export function JobDetail() {
  const { id } = useParams();
  const { data: job, loading, error, refetch } = useAsync(
    () => fetchJob(id ?? ""),
    [id]
  );

  const [otp, setOtp] = useState<string | null>(null);
  const [otpBusy, setOtpBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingBusy, setRatingBusy] = useState(false);
  const [rated, setRated] = useState(false);

  const backLink = (
    <Link
      to="/dashboard"
      className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-brand-hover"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to dashboard
    </Link>
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        {backLink}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-full" />
        </Card>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="space-y-4">
        {backLink}
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {error ? "We couldn't load this job." : "Job not found."}
          </p>
          {error && (
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-on-brand text-sm font-bold cursor-pointer"
            >
              Try again
            </button>
          )}
        </Card>
      </div>
    );
  }

  const stageLabel =
    STAGES.find((stage) => stage.id === job.status)?.label ?? job.status;
  const displayOtp = otp ?? job.startOtp;

  const generateOtp = async () => {
    setOtpBusy(true);
    try {
      const result = await requestJobStartOtp(job.id);
      setOtp(result.otp);
    } finally {
      setOtpBusy(false);
    }
  };

  const copyOtp = async () => {
    if (!displayOtp) return;
    try {
      await navigator.clipboard.writeText(displayOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const submitRating = async () => {
    if (stars < 1) return;
    setRatingBusy(true);
    try {
      const updated = await rateJob(job.id, stars, comment);
      if (updated) setRated(true);
      refetch();
    } finally {
      setRatingBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {backLink}

      <Card className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-brand-soft text-brand-strong flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {job.id.toUpperCase()}
              </p>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">
                {job.serviceName}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {job.issueTypes?.join(", ") || "General service"}
              </p>
            </div>
          </div>
          <Badge variant={JOB_BADGE[job.status] ?? "neutral"}>{stageLabel}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
              Scheduled
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {job.scheduledAt ?? "Not confirmed"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
              Amount
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {job.amount ? formatINR(job.amount) : "Quote after visit"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
              Raised on
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {job.createdAt ? formatDate(job.createdAt) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
              Rating
            </p>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {job.rating ? `${job.rating} / 5` : "Not rated"}
            </p>
          </div>
        </div>

        {job.address && (
          <div className="border-t border-border pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-subtle-foreground">
              Service address
            </p>
            <p className="text-sm text-foreground-soft mt-0.5">{job.address}</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-extrabold text-foreground tracking-tight mb-5">
          Job progress
        </h2>
        <StatusTimeline
          stages={STAGES.map((stage) => ({
            id: stage.id,
            label: stage.label,
            description: stage.description,
          }))}
          currentId={job.status}
        />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-extrabold text-foreground">Your technician</h2>
          {job.technician ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-inverse text-brand flex items-center justify-center font-extrabold">
                {job.technician
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{job.technician}</p>
                {job.technicianPhone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {job.technicianPhone}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              We're assigning a vetted technician. You'll get a notification once
              confirmed.
            </p>
          )}
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-extrabold text-foreground">Start-Job OTP</h2>
          </div>
          {job.status === "completed" ? (
            <p className="text-xs text-muted-foreground">
              This job is complete. The Start-Job OTP is no longer active.
            </p>
          ) : job.status === "cancelled" ? (
            <p className="text-xs text-muted-foreground">
              This request was cancelled. The Start-Job OTP is no longer active.
            </p>
          ) : displayOtp ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-extrabold tracking-[0.3em] text-foreground">
                  {displayOtp}
                </p>
                <button
                  type="button"
                  onClick={copyOtp}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-brand/60 transition-colors cursor-pointer"
                  aria-label="Copy OTP"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {copied
                  ? "Copied to clipboard."
                  : "Share this only when the technician arrives to start the job."}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Generate the OTP when the technician is ready to begin.
              </p>
              <Button variant="secondary" onClick={generateOtp} disabled={otpBusy}>
                {otpBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate OTP"
                )}
              </Button>
            </>
          )}
        </Card>
      </div>

      {job.status === "completed" && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-brand" />
            <h2 className="text-base font-extrabold text-foreground">Rate this job</h2>
          </div>

          {job.rating && !rated ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-5 h-5 ${
                      index < (job.rating ?? 0)
                        ? "fill-brand text-brand"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              {job.ratingComment && (
                <p className="text-xs text-muted-foreground">{job.ratingComment}</p>
              )}
            </div>
          ) : rated || job.rating ? (
            <div className="flex items-center gap-2 text-sm text-success-fg">
              <CheckCircle2 className="w-4 h-4" />
              Thanks for rating this job.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStars(value)}
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          value <= stars ? "fill-brand text-brand" : "text-border"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <Textarea
                rows={2}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Anything we should know about the work? (optional)"
              />
              <Button onClick={submitRating} disabled={stars < 1 || ratingBusy}>
                {ratingBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Submit rating"
                )}
              </Button>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
