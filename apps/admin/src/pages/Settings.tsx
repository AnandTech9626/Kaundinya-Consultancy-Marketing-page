import { Building2, MapPin, Phone, Clock } from "lucide-react";
import { Card } from "@kaundinya/ui";
import { CONTACT_PERSONS, SITE_INFO } from "@kaundinya/config";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2.5 border-t border-border-subtle first:border-t-0">
      <span className="text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className="text-sm font-semibold text-charcoal">{value}</span>
    </div>
  );
}

export function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Settings
        </h1>
        <p className="text-muted mt-1">Organisation profile and contact details.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-gold" />
          <h2 className="text-base font-extrabold text-charcoal tracking-tight">
            Organisation
          </h2>
        </div>
        <Row label="Display name" value={SITE_INFO.name} />
        <Row label="Full name" value={SITE_INFO.fullName} />
        <Row label="Tagline" value={SITE_INFO.tagline} />
        <Row label="Website" value={SITE_INFO.url} />
        <div className="flex items-center gap-2 pt-3">
          <MapPin className="w-4 h-4 text-gold" />
          <p className="text-sm text-charcoal-light">{SITE_INFO.serviceArea}</p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-4 h-4 text-gold" />
          <h2 className="text-base font-extrabold text-charcoal tracking-tight">
            Contact persons
          </h2>
        </div>
        <div className="space-y-3">
          {CONTACT_PERSONS.map((p) => (
            <div key={p.name} className="rounded-xl bg-ivory p-3 border border-border-subtle">
              <p className="text-sm font-bold text-charcoal">{p.name}</p>
              <p className="text-xs text-muted">{p.role}</p>
              <p className="text-xs font-semibold text-charcoal-light mt-1">{p.phone}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gold" />
          <h2 className="text-base font-extrabold text-charcoal tracking-tight">
            Business hours
          </h2>
        </div>
        <Row label="Monday – Saturday" value="10:00 AM – 7:00 PM" />
        <Row label="Sunday" value="Closed" />
      </Card>
    </div>
  );
}
