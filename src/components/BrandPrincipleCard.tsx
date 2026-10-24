import { MessageSquareCheck, UserCheck, Compass, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  MessageSquareCheck,
  UserCheck,
  Compass,
  Workflow,
};

interface Props {
  icon: string;
  title: string;
  description: string;
}

export default function BrandPrincipleCard({ icon, title, description }: Props) {
  const Icon = ICONS[icon] ?? Compass;

  return (
    <div className="group h-full bg-ivory/60 rounded-2xl border border-border-subtle hover:border-gold/60 shadow-sm hover:shadow-md transition-all duration-200 p-7">
      <div className="space-y-4">
        <div className="w-12 h-12 rounded-full bg-gold/15 text-gold flex items-center justify-center group-hover:bg-gold group-hover:text-charcoal transition-colors duration-200">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-charcoal">{title}</h3>
        <p className="text-sm text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
