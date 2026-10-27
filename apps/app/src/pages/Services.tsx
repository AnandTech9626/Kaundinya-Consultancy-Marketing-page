import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card } from "@kaundinya/ui";
import { SERVICE_CATEGORIES } from "@kaundinya/config";
import { getServiceIcon } from "../lib/icons";

export function Services() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
          Request a Service
        </h1>
        <p className="text-muted mt-1">
          Choose a category below to explore and request tailored assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICE_CATEGORIES.map((cat) => {
          const Icon = getServiceIcon(cat.icon);
          return (
            <Link key={cat.id} to={`/services/${cat.slug}`} className="block">
              <Card className="p-6 h-full transition-all duration-200 hover:shadow-lg hover:border-gold/60 hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold-light text-[#B8860B] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h2 className="text-base font-bold text-charcoal leading-snug">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-muted leading-relaxed">{cat.tagline}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal">Explore Service</span>
                  <ArrowRight className="w-4 h-4 text-gold" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
