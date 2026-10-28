import { useMemo, useState } from "react";
import { Check, Pencil, Search, X } from "lucide-react";
import { Badge, Card, Input, Select, Skeleton } from "@kaundinya/ui";
import {
  MODULE_META,
  SERVICE_CATEGORIES,
  type ServiceCategoryId,
} from "@kaundinya/config";
import {
  fetchAdminServices,
  updateServiceActive,
  updateServicePricing,
} from "../lib/mockApi";
import { useAsync } from "../lib/useAsync";

export function Services() {
  const { data, loading, error, refetch } = useAsync(fetchAdminServices);
  const [category, setCategory] = useState<ServiceCategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState("");

  const services = data ?? [];
  const activeCount = services.filter((service) => service.active).length;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      if (category !== "all" && service.categoryId !== category) return false;
      if (!needle) return true;
      return `${service.name} ${service.summary}`.toLowerCase().includes(needle);
    });
  }, [services, category, query]);

  const toggle = async (id: string, active: boolean) => {
    setBusy(`${id}-active`);
    try {
      await updateServiceActive(id, active);
      refetch();
    } finally {
      setBusy(null);
    }
  };

  const startPrice = (id: string, value: string) => {
    setEditingId(id);
    setPriceValue(value);
  };

  const savePrice = async (id: string) => {
    if (!priceValue.trim()) return;
    setBusy(`${id}-price`);
    try {
      await updateServicePricing(id, priceValue.trim());
      setEditingId(null);
      refetch();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Services
          </h1>
          <p className="text-muted mt-1">
            Manage the catalog shared with the marketing and client apps.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success">{activeCount} active</Badge>
          <Badge variant="neutral">{services.length} total</Badge>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light" />
            <Input
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sub-services"
              aria-label="Search services"
            />
          </div>
          <Select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as ServiceCategoryId | "all")
            }
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {SERVICE_CATEGORIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error ? (
        <Card className="p-10 text-center space-y-3">
          <p className="text-sm text-muted">We couldn't load the catalog.</p>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-charcoal text-sm font-bold cursor-pointer"
          >
            Try again
          </button>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="p-5 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          No services match this search.
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((service) => (
            <Card key={service.id} className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-charcoal">{service.name}</p>
                    <Badge variant={service.active ? "success" : "neutral"}>
                      {service.active ? "Active" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    {MODULE_META[service.categoryId].shortName} · {service.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {editingId === service.id ? (
                    <>
                      <Input
                        className="w-36"
                        value={priceValue}
                        onChange={(event) => setPriceValue(event.target.value)}
                        aria-label={`Pricing for ${service.name}`}
                      />
                      <button
                        type="button"
                        disabled={busy === `${service.id}-price`}
                        onClick={() => void savePrice(service.id)}
                        className="p-2 rounded-lg bg-gold text-charcoal hover:bg-gold-hover transition-colors cursor-pointer disabled:opacity-50"
                        aria-label="Save pricing"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-lg border border-border-subtle bg-white text-muted hover:text-charcoal transition-colors cursor-pointer"
                        aria-label="Cancel pricing edit"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="rounded-lg bg-ivory px-2.5 py-1 text-xs font-bold text-charcoal">
                        {service.pricingLabel}
                      </span>
                      <button
                        type="button"
                        onClick={() => startPrice(service.id, service.pricingLabel)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-white px-2.5 py-1 text-[11px] font-bold text-muted hover:border-gold/60 hover:text-charcoal transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        Price
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={busy === `${service.id}-active`}
                    onClick={() => void toggle(service.id, !service.active)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                      service.active
                        ? "border border-border-subtle bg-white text-muted hover:border-rose-300 hover:text-rose-600"
                        : "bg-gold text-charcoal hover:bg-gold-hover"
                    }`}
                  >
                    {service.active ? "Hide" : "Activate"}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
