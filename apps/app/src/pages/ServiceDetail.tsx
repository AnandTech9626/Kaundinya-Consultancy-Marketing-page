import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Check, Loader2 } from "lucide-react";
import { Button, Card, FormField, Select, Textarea } from "@kaundinya/ui";
import { SERVICE_CATEGORIES } from "@kaundinya/config";
import { getServiceIcon } from "../lib/icons";
import { createRequest } from "../lib/mockApi";

export function ServiceDetail() {
  const { slug } = useParams();
  const category = SERVICE_CATEGORIES.find((c) => c.slug === slug);
  const [service, setService] = useState("");
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!category) {
    return (
      <div className="space-y-4">
        <Link to="/services" className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover">
          <ArrowLeft className="w-4 h-4" />
          Back to services
        </Link>
        <Card className="p-10 text-center text-sm text-muted">Service not found.</Card>
      </div>
    );
  }

  const Icon = getServiceIcon(category.icon);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!service || submitting) return;
    setSubmitting(true);
    // Real API call will replace this mock layer (see docs/api-contract.md).
    await createRequest({
      serviceCategory: category.name,
      specificService: service,
      comments,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        to="/services"
        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to services
      </Link>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm text-muted leading-relaxed">{category.description}</p>
          </div>
        </div>

        <div className="border-t border-border-subtle pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">
            What we offer
          </p>
          <ul className="space-y-2">
            {category.services.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-charcoal-light">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {submitted ? (
        <Card className="p-8 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-charcoal tracking-tight">
            Request Submitted
          </h2>
          <p className="text-sm text-muted max-w-sm mx-auto">
            Thank you! Our team will review your request and contact you shortly.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold"
            >
              View my requests
            </Link>
            <Button variant="secondary" onClick={() => setSubmitted(false)}>
              Submit another request
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h2 className="text-base font-extrabold text-charcoal tracking-tight mb-4">
            Request this service
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Select a service" htmlFor="service" required>
              <Select
                id="service"
                value={service}
                onChange={(e) => setService(e.target.value)}
              >
                <option value="">Choose an option</option>
                {category.services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Anything else we should know? (optional)" htmlFor="comments">
              <Textarea
                id="comments"
                rows={3}
                placeholder="Briefly describe your requirement"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={!service || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
