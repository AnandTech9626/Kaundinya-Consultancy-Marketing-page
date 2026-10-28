import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import {
  Button,
  Card,
  FormField,
  Input,
  Select,
  Textarea,
} from "@kaundinya/ui";
import type { InteriorConsultation } from "@kaundinya/config";
import {
  createInteriorConsultation,
  fetchInteriorConsultations,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";
import { useAuth } from "../lib/auth";
import { formatDate } from "../lib/formats";

const PORTFOLIO = [
  { title: "Warm minimal living room", meta: "Kondapur · 3 BHK", tone: "from-[#3b3420] via-[#171717] to-[#2a2117]" },
  { title: "Modular kitchen", meta: "Gachibowli · 2 BHK", tone: "from-[#23303b] via-[#171717] to-[#1b2630]" },
  { title: "Guest bedroom", meta: "Kompally · Villa", tone: "from-[#3b2323] via-[#171717] to-[#2b1b1b]" },
  { title: "Home office", meta: "Hitec City · 3 BHK", tone: "from-[#233b2c] via-[#171717] to-[#1b2b21]" },
  { title: "Kids room", meta: "Miyapur · 2 BHK", tone: "from-[#3b3523] via-[#171717] to-[#2b271b]" },
  { title: "Wardrobe & storage", meta: "Kukatpally · 3 BHK", tone: "from-[#2c233b] via-[#171717] to-[#221b2b]" },
];

const STYLES = ["Warm minimal", "Contemporary", "Traditional", "Industrial", "Scandi"];
const BUDGETS = ["Under ₹5 L", "₹5–8 L", "₹8–12 L", "₹12–20 L", "₹20 L+"];

export function Interiors() {
  const { user } = useAuth();
  const { data, refetch } = useAsync(fetchInteriorConsultations);
  const [name, setName] = useState(user?.name ?? "");
  const [mobile, setMobile] = useState(user?.mobile ?? "");
  const [style, setStyle] = useState(STYLES[0]);
  const [budget, setBudget] = useState(BUDGETS[2]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<InteriorConsultation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const consultations = data ?? [];
  const canSubmit = name.trim().length >= 2 && /^\d{10}$/.test(mobile);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const record = await createInteriorConsultation({
        name,
        mobile,
        style,
        budget,
        notes,
      });
      setCreated(record);
      setNotes("");
      refetch();
    } catch {
      setError("We couldn't book the consultation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        to="/home-services"
        className="inline-flex items-center gap-1 text-sm font-bold text-gold hover:text-gold-hover"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home services
      </Link>

      <div>
        <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-gold">
          Home Services
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Interiors & modular fitout
        </h1>
        <p className="text-muted mt-1 max-w-2xl">
          Browse recent work, then book a free initial consultation to scope your home.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {PORTFOLIO.map((project) => (
          <Card key={project.title} className="overflow-hidden p-0">
            <div
              className={`relative h-40 sm:h-48 bg-gradient-to-br ${project.tone} flex items-end p-4`}
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_25%_20%,#f5b900_0,transparent_45%)]" />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
                  {project.meta}
                </p>
                <p className="text-sm font-extrabold text-white leading-snug">
                  {project.title}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 sm:p-6">
          {created ? (
            <div className="text-center space-y-3 py-6">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-charcoal tracking-tight">
                Consultation requested
              </h2>
              <p className="text-sm text-muted max-w-sm mx-auto">
                We'll call you on {created.mobile} to understand the space and schedule a
                designer visit.
              </p>
              <Button variant="secondary" onClick={() => setCreated(null)}>
                Book another consultation
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-charcoal">
                  Book a free consultation
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  No design fee. We'll walk through options and timelines.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Your name" htmlFor="int-name" required>
                  <Input
                    id="int-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </FormField>
                <FormField label="Mobile" htmlFor="int-mobile" required>
                  <Input
                    id="int-mobile"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(event) =>
                      setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Preferred style" htmlFor="int-style">
                  <Select
                    id="int-style"
                    value={style}
                    onChange={(event) => setStyle(event.target.value)}
                  >
                    {STYLES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Budget range" htmlFor="int-budget">
                  <Select
                    id="int-budget"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                  >
                    {BUDGETS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </div>

              <FormField label="What are you planning? (optional)" htmlFor="int-notes">
                <Textarea
                  id="int-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Rooms, must-haves, possession date..."
                />
              </FormField>

              {error && <p className="text-[11px] text-rose-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={!canSubmit || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Request consultation"
                )}
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <h2 className="text-sm font-extrabold text-charcoal">What's included</h2>
            </div>
            <ul className="space-y-2 text-xs text-muted leading-relaxed">
              <li>Space walkthrough and measurement</li>
              <li>Material and finish options</li>
              <li>Modular kitchen, wardrobes and storage plan</li>
              <li>Timeline and transparent quote</li>
            </ul>
          </Card>

          {consultations.length > 0 && (
            <Card className="p-5 space-y-2">
              <h2 className="text-sm font-extrabold text-charcoal">
                Previous consultations
              </h2>
              {consultations.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border-subtle bg-white px-3 py-2"
                >
                  <p className="text-xs font-bold text-charcoal">
                    {item.style} · {item.budget}
                  </p>
                  <p className="text-[10px] text-muted">
                    {item.status} · {formatDate(item.createdAt)}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
