import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge, Button, Card } from "@kaundinya/ui";
import type { CreditHealth as CreditResult } from "@kaundinya/config";
import { COMPLIANCE } from "@kaundinya/config";
import { checkCreditHealth } from "../lib/mockApi";

export function CreditHealth() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CreditResult | null>(null);

  const runCheck = async () => {
    setBusy(true);
    try {
      const response = await checkCreditHealth();
      setResult(response);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        to="/loans"
        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to loans
      </Link>

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Loans
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Check credit health
        </h1>
        <p className="text-muted mt-1">
          A soft pull shows your score band and eligible products without affecting your
          CIBIL score.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-charcoal">
              What a soft pull does
            </h2>
            <ul className="mt-2 space-y-1.5 text-xs text-muted leading-relaxed">
              <li>Reads your existing credit summary — no new enquiry is recorded.</li>
              <li>Does not lower your score or appear to lenders as a hard check.</li>
              <li>Helps us route your file to lenders likely to approve it.</li>
            </ul>
          </div>
        </div>

        {!result ? (
          <Button className="w-full" onClick={runCheck} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking (soft pull)...
              </>
            ) : (
              "Run soft credit check"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-charcoal p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ivory/50">
                Score band
              </p>
              <div className="flex items-end justify-between gap-3 mt-1">
                <p className="text-3xl font-extrabold tracking-tight capitalize text-gold">
                  {result.scoreBand.replace("_", " ")}
                </p>
                <Badge variant={result.scoreBand === "needs_work" ? "warning" : "success"}>
                  Soft pull
                </Badge>
              </div>
              <p className="text-[11px] text-ivory/60 mt-1">{result.note}</p>
            </div>

            <div>
              <p className="text-xs font-bold text-charcoal mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Products you may qualify for
              </p>
              <ul className="space-y-1.5">
                {result.eligibleProducts.map((product) => (
                  <li
                    key={product}
                    className="flex items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 py-2 text-xs text-charcoal-light"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {product}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/loans/apply"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
              >
                Start an application
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Button variant="secondary" onClick={runCheck} disabled={busy}>
                {busy ? "Refreshing..." : "Re-run check"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 bg-ivory/60">
        <p className="text-[11px] font-bold text-charcoal">{COMPLIANCE.rbi.label}</p>
        <p className="text-[11px] text-muted leading-relaxed mt-1">
          {COMPLIANCE.rbi.note} {COMPLIANCE.dpdp.note} This screen is a UI mock — the live
          soft pull requires a bureau integration and explicit consent.
        </p>
      </Card>
    </div>
  );
}
