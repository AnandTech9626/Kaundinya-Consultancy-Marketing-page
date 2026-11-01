import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { AlertTriangle, Building2, Plus, Search, X } from "lucide-react";
import {
  addAdminEnquiryNote,
  createAdminProperty,
  deleteAdminProperty,
  fetchAdminProperties,
  fetchAdminRealEstateRequests,
  updateAdminEnquiry,
  updateAdminProperty,
  updateAdminRequest,
  updateAdminSiteVisit,
  updateAdminValuation,
  type AdminEnquiry,
  type AdminProperty,
  type AdminPropertyStatus,
  type AdminRealEstateRequests,
  type AdminRequestKind,
  type AdminSiteVisit,
  type AdminValuation,
} from "../lib/api";
import { formatDateTime, formatPrice } from "../lib/format";
import { showToast } from "../lib/toast";

const STATUS_STYLES: Record<AdminPropertyStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  sold: "border-blue-200 bg-blue-50 text-blue-700",
  rented: "border-violet-200 bg-violet-50 text-violet-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const STATUS_LABELS: Record<AdminPropertyStatus, string> = {
  active: "Live",
  draft: "Pending",
  sold: "Sold",
  rented: "Rented",
  rejected: "Rejected",
};

type ViewMode = "all" | "individual";

function StatusBadge({ status }: { status: AdminPropertyStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function PropertyRow({
  property,
  selected,
  onSelect,
}: {
  property: AdminProperty;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start justify-between gap-3 rounded-lg border p-2.5 text-left transition-colors ${
        selected
          ? "border-gold bg-gold-light/40"
          : "border-border-subtle hover:border-gold/60"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="line-clamp-1 text-xs font-bold text-charcoal">
            {property.title}
          </p>
          <span className="shrink-0 rounded bg-ivory px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted">
            {property.listingType === "rent" ? "Rent" : "Sale"}
          </span>
        </div>
        <p className="line-clamp-1 text-[11px] text-muted">
          {property.bhk} · {property.location} · {property.pincode}
        </p>
        <p className="mt-0.5 text-[11px] font-extrabold text-charcoal">
          {formatPrice(property.price, property.priceUnit)}
        </p>
      </div>
      <StatusBadge status={property.status} />
    </button>
  );
}

function PropertySheet({
  property,
  onClose,
  onChanged,
}: {
  property: AdminProperty;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const runStatus = async (status: AdminPropertyStatus) => {
    setBusy(true);
    setActionError(null);
    try {
      await updateAdminProperty(property.id, { status });
      onChanged();
      showToast("Property updated.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not update property.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setActionError(null);
    try {
      await deleteAdminProperty(property.id);
      onChanged();
      onClose();
      showToast("Property deleted permanently.");
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not delete property.",
      );
      setBusy(false);
    }
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const facts: Array<[string, string]> = [
    ["BHK", property.bhk],
    ["Type", property.propertyType],
    ["Area", `${property.areaSqft.toLocaleString("en-IN")} sq.ft`],
    ["Furnishing", property.furnishing ?? "Not specified"],
    ["Posted", property.createdAt],
    ["Listing ID", property.id],
  ];

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-sheet-title"
    >
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
              Property details
            </p>
            <h2
              id="property-sheet-title"
              className="mt-1 text-lg font-extrabold tracking-tight text-charcoal"
            >
              {property.title}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {property.location}, {property.city} · {property.pincode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close property details"
            className="shrink-0 rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="flex flex-wrap gap-2">
            {property.status !== "active" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => runStatus("active")}
                className="rounded-lg bg-gold px-3 py-1.5 text-[11px] font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
              >
                Approve &amp; go live
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => runStatus("rejected")}
                className="rounded-lg border border-border-subtle px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60 disabled:opacity-50"
              >
                Unpublish
              </button>
            )}

            {property.listingType === "sale" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => runStatus("sold")}
                className="rounded-lg border border-border-subtle px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60 disabled:opacity-50"
              >
                Mark sold
              </button>
            )}

            {property.listingType === "rent" && (
              <button
                type="button"
                disabled={busy}
                onClick={() => runStatus("rented")}
                className="rounded-lg border border-border-subtle px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60 disabled:opacity-50"
              >
                Mark rented
              </button>
            )}

            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(true)}
              className="rounded-lg border border-border-subtle px-3 py-1.5 text-[11px] font-bold text-charcoal hover:border-gold/60 disabled:opacity-50"
            >
              Edit
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
            >
              Delete
            </button>
          </div>

          {actionError && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">
              {actionError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border-subtle bg-ivory px-2.5 py-0.5 text-[11px] font-bold text-charcoal">
              {property.listingType === "rent" ? "For Rent" : "For Sale"}
            </span>
            <StatusBadge status={property.status} />
            {property.featured && (
              <span className="rounded-full border border-gold/30 bg-gold/15 px-2.5 py-0.5 text-[11px] font-bold text-[#8a6b1a]">
                Featured
              </span>
            )}
          </div>

          <p className="text-2xl font-extrabold tracking-tight text-charcoal">
            {formatPrice(property.price, property.priceUnit)}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-ivory p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                  {label}
                </p>
                <p className="mt-0.5 break-words text-xs font-bold text-charcoal">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal">
              Description
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              {property.description || "No description provided."}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal">
              Amenities
            </h3>
            {property.amenities.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {property.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-semibold text-charcoal"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted">No amenities listed.</p>
            )}
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal">
              RERA
            </h3>
            <p className="mt-1 text-xs text-muted">
              {property.reraAgentNumber ?? "Not provided"}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal">
              Photos
            </h3>
            {property.images.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {property.images.map((src, index) => (
                  <img
                    key={`${src}-${index}`}
                    src={src}
                    alt={`${property.title} ${index + 1}`}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted">No photos uploaded.</p>
            )}
          </section>
        </div>
      </div>

      {editing && (
        <PropertyEditModal
          property={property}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onChanged();
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete property?"
          message="This will permanently delete this property from the database. This action cannot be undone."
          confirmLabel="Delete permanently"
          busy={busy}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/60"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative z-10 w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h3
              id="confirm-title"
              className="text-base font-extrabold tracking-tight text-charcoal"
            >
              {title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {busy ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const PROPERTY_TYPE_OPTIONS = [
  "Apartment",
  "Villa",
  "Independent House",
  "Plot",
  "Commercial",
];

function PropertyEditModal({
  property,
  onClose,
  onSaved,
}: {
  property: AdminProperty;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(property.title);
  const [description, setDescription] = useState(property.description);
  const [price, setPrice] = useState(String(property.price));
  const [location, setLocation] = useState(property.location);
  const [pincode, setPincode] = useState(property.pincode);
  const [bhk, setBhk] = useState(property.bhk);
  const [propertyType, setPropertyType] = useState(property.propertyType);
  const [listingType, setListingType] = useState<"rent" | "sale">(
    property.listingType,
  );
  const [furnishing, setFurnishing] = useState(property.furnishing ?? "");
  const [amenities, setAmenities] = useState(property.amenities.join(", "));
  const [reraAgentNumber, setReraAgentNumber] = useState(
    property.reraAgentNumber ?? "",
  );
  const [areaSqft, setAreaSqft] = useState(String(property.areaSqft));
  const [status, setStatus] = useState<AdminPropertyStatus>(property.status);
  const [featured, setFeatured] = useState(property.featured);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";
  const labelClass = "mb-1 block text-[11px] font-bold text-charcoal";

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await updateAdminProperty(property.id, {
        title,
        description,
        price: Number(price),
        location,
        pincode,
        bhk,
        propertyType,
        listingType,
        furnishing: furnishing.trim() || null,
        amenities: amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        reraAgentNumber: reraAgentNumber.trim() || null,
        areaSqft: Number(areaSqft),
        status,
        featured,
      });
      onSaved();
      showToast("Property updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save property.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <form
        onSubmit={save}
        className="relative z-10 max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
      >
        <h3 className="text-lg font-extrabold tracking-tight text-charcoal">
          Edit property
        </h3>

        <div>
          <label className={labelClass} htmlFor="edit-title">
            Title
          </label>
          <input
            id="edit-title"
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="edit-price">
              Price (₹)
            </label>
            <input
              id="edit-price"
              inputMode="numeric"
              className={inputClass}
              value={price}
              onChange={(event) =>
                setPrice(event.target.value.replace(/\D/g, ""))
              }
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-area">
              Area (sq.ft)
            </label>
            <input
              id="edit-area"
              inputMode="numeric"
              className={inputClass}
              value={areaSqft}
              onChange={(event) =>
                setAreaSqft(event.target.value.replace(/\D/g, ""))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="edit-bhk">
              BHK
            </label>
            <input
              id="edit-bhk"
              className={inputClass}
              value={bhk}
              onChange={(event) => setBhk(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-type">
              Property type
            </label>
            <select
              id="edit-type"
              className={inputClass}
              value={propertyType}
              onChange={(event) => setPropertyType(event.target.value)}
            >
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="edit-location">
              Location
            </label>
            <input
              id="edit-location"
              className={inputClass}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-pincode">
              Pincode
            </label>
            <input
              id="edit-pincode"
              inputMode="numeric"
              className={inputClass}
              value={pincode}
              onChange={(event) =>
                setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="edit-listing-type">
              Listing type
            </label>
            <select
              id="edit-listing-type"
              className={inputClass}
              value={listingType}
              onChange={(event) =>
                setListingType(event.target.value as "rent" | "sale")
              }
            >
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="edit-furnishing">
              Furnishing
            </label>
            <input
              id="edit-furnishing"
              className={inputClass}
              value={furnishing}
              onChange={(event) => setFurnishing(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="edit-amenities">
            Amenities (comma separated)
          </label>
          <input
            id="edit-amenities"
            className={inputClass}
            value={amenities}
            onChange={(event) => setAmenities(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="edit-rera">
            RERA number
          </label>
          <input
            id="edit-rera"
            className={inputClass}
            value={reraAgentNumber}
            onChange={(event) => setReraAgentNumber(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="edit-status">
              Status
            </label>
            <select
              id="edit-status"
              className={inputClass}
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as AdminPropertyStatus)
              }
            >
              {(
                ["draft", "active", "sold", "rented", "rejected"] as const
              ).map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-end gap-2 pb-2.5 text-xs font-bold text-charcoal">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
            />
            Featured
          </label>
        </div>

        <div>
          <label className={labelClass} htmlFor="edit-description">
            Description
          </label>
          <textarea
            id="edit-description"
            rows={3}
            className={inputClass}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
          >
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AddPropertyModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [category, setCategory] = useState<"sale" | "rent" | "purchase">("sale");
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [bhk, setBhk] = useState("2 BHK");
  const [areaSqft, setAreaSqft] = useState("");
  const [location, setLocation] = useState("");
  const [pincode, setPincode] = useState("");
  const [price, setPrice] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState("");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30";
  const labelClass = "mb-1 block text-[11px] font-bold text-charcoal";

  const valid =
    title.trim().length >= 6 &&
    location.trim().length >= 2 &&
    /^\d{6}$/.test(pincode) &&
    Number(price) > 0 &&
    Number(areaSqft) > 0;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!valid || busy) return;

    setBusy(true);
    setError(null);

    try {
      await createAdminProperty({
        title: title.trim(),
        description: description.trim(),
        listingType: category === "rent" ? "rent" : "sale",
        propertyType,
        bhk,
        location: location.trim(),
        pincode,
        price: Number(price),
        areaSqft: Number(areaSqft),
        furnishing: furnishing.trim() || undefined,
        amenities: amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status: category === "purchase" ? "sold" : "active",
        featured,
      });
      onSaved();
      showToast("Property added and published.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add property.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/60"
        onClick={onClose}
        aria-hidden="true"
      />
      <form
        onSubmit={save}
        className="relative z-10 max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-charcoal">
            Add property
          </h3>
          <p className="text-[11px] text-muted">
            Admin-added properties go live immediately.
          </p>
        </div>

        <div>
          <label className={labelClass} htmlFor="add-section">
            Section
          </label>
          <select
            id="add-section"
            className={inputClass}
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as "sale" | "rent" | "purchase")
            }
          >
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
            <option value="purchase">Purchase (already sold)</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="add-title">
            Title
          </label>
          <input
            id="add-title"
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Spacious 3 BHK in Gachibowli"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="add-type">
              Property type
            </label>
            <select
              id="add-type"
              className={inputClass}
              value={propertyType}
              onChange={(event) => setPropertyType(event.target.value)}
            >
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="add-bhk">
              BHK
            </label>
            <input
              id="add-bhk"
              className={inputClass}
              value={bhk}
              onChange={(event) => setBhk(event.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="add-area">
              Area (sq.ft)
            </label>
            <input
              id="add-area"
              inputMode="numeric"
              className={inputClass}
              value={areaSqft}
              onChange={(event) =>
                setAreaSqft(event.target.value.replace(/\D/g, ""))
              }
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="add-price">
              {category === "rent" ? "Monthly rent (₹)" : "Price (₹)"}
            </label>
            <input
              id="add-price"
              inputMode="numeric"
              className={inputClass}
              value={price}
              onChange={(event) =>
                setPrice(event.target.value.replace(/\D/g, ""))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="add-location">
              Location
            </label>
            <input
              id="add-location"
              className={inputClass}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Gachibowli"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="add-pincode">
              Pincode
            </label>
            <input
              id="add-pincode"
              inputMode="numeric"
              className={inputClass}
              value={pincode}
              onChange={(event) =>
                setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="add-furnishing">
            Furnishing (optional)
          </label>
          <input
            id="add-furnishing"
            className={inputClass}
            value={furnishing}
            onChange={(event) => setFurnishing(event.target.value)}
            placeholder="Unfurnished / Semi-furnished / Fully furnished"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="add-amenities">
            Amenities (comma separated)
          </label>
          <input
            id="add-amenities"
            className={inputClass}
            value={amenities}
            onChange={(event) => setAmenities(event.target.value)}
            placeholder="Parking, Lift, Power backup"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="add-description">
            Description (optional)
          </label>
          <textarea
            id="add-description"
            rows={3}
            className={inputClass}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-charcoal">
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => setFeatured(event.target.checked)}
          />
          Featured
        </label>

        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!valid || busy}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {busy ? "Adding..." : "Add property"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function RealEstateProperties() {
  const [view, setView] = useState<ViewMode>("all");
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState({ q: "", min: "", max: "" });
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [bhkFilter, setBhkFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const timer = setTimeout(
      () =>
        setApplied({ q: query.trim(), min: minPrice, max: maxPrice }),
      300,
    );
    return () => clearTimeout(timer);
  }, [query, minPrice, maxPrice]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdminProperties({
      q: applied.q,
      status: statusFilter || undefined,
      listingType: typeFilter || undefined,
      bhk: bhkFilter || undefined,
      minPrice: applied.min ? Number(applied.min) : undefined,
      maxPrice: applied.max ? Number(applied.max) : undefined,
    })
      .then((data) => {
        if (!cancelled) setProperties(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load properties.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    applied.q,
    applied.min,
    applied.max,
    statusFilter,
    typeFilter,
    bhkFilter,
    reloadKey,
  ]);

  const resetFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setBhkFilter("");
    setMinPrice("");
    setMaxPrice("");
  };

  const groups = useMemo(
    () => [
      {
        label: "Sales",
        items: properties.filter(
          (item) => item.listingType === "sale" && item.status !== "sold",
        ),
      },
      {
        label: "Rent",
        items: properties.filter(
          (item) => item.listingType === "rent" && item.status !== "rented",
        ),
      },
      {
        label: "Purchase",
        items: properties.filter(
          (item) => item.status === "sold" || item.status === "rented",
        ),
      },
    ],
    [properties],
  );

  const selected = properties.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:h-[calc(100vh-8rem)] lg:grid-cols-2">
      <div className="flex min-h-0 flex-col gap-3 lg:h-full">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold tracking-tight text-charcoal">
            Properties
          </h2>
          <span className="text-[11px] font-semibold text-muted">
            {properties.length} total
          </span>
        </div>

        <section className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border-subtle bg-white p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-border-subtle bg-ivory p-1">
          {(
            [
              { value: "all", label: "All" },
              { value: "individual", label: "Individual" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setView(tab.value)}
              className={`rounded-lg py-2 text-sm font-bold transition-colors ${
                view === tab.value
                  ? "bg-charcoal text-white"
                  : "text-charcoal hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, location or pincode"
              aria-label="Search properties"
              className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-9 pr-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-bold text-charcoal transition-colors hover:bg-gold-hover"
          >
            <Plus className="h-4 w-4" />
            Add property
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-white px-2.5 py-2 text-xs font-semibold text-charcoal outline-none focus:border-gold"
          >
            <option value="">All statuses</option>
            <option value="active">Live</option>
            <option value="draft">Pending</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            aria-label="Filter by listing type"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-white px-2.5 py-2 text-xs font-semibold text-charcoal outline-none focus:border-gold"
          >
            <option value="">All types</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
          <select
            aria-label="Filter by BHK"
            value={bhkFilter}
            onChange={(event) => setBhkFilter(event.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-white px-2.5 py-2 text-xs font-semibold text-charcoal outline-none focus:border-gold"
          >
            <option value="">Any BHK</option>
            <option value="1 BHK">1 BHK</option>
            <option value="2 BHK">2 BHK</option>
            <option value="3 BHK">3 BHK</option>
            <option value="4 BHK">4 BHK</option>
          </select>
          <input
            aria-label="Minimum price"
            inputMode="numeric"
            placeholder="Min price"
            value={minPrice}
            onChange={(event) =>
              setMinPrice(event.target.value.replace(/\D/g, ""))
            }
            className="w-full rounded-lg border border-border-subtle bg-white px-2.5 py-2 text-xs font-semibold text-charcoal outline-none focus:border-gold"
          />
          <input
            aria-label="Maximum price"
            inputMode="numeric"
            placeholder="Max price"
            value={maxPrice}
            onChange={(event) =>
              setMaxPrice(event.target.value.replace(/\D/g, ""))
            }
            className="w-full rounded-lg border border-border-subtle bg-white px-2.5 py-2 text-xs font-semibold text-charcoal outline-none focus:border-gold"
          />
          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-lg border border-border-subtle bg-white px-2.5 py-2 text-xs font-bold text-charcoal hover:border-gold/60"
          >
            Reset filters
          </button>
        </div>

        {loading ? (
          <div className="mt-3 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-border-subtle p-3"
              >
                <div className="h-3 w-2/3 animate-pulse rounded bg-ivory-dark" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-ivory-dark" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-3 space-y-2 rounded-xl border border-dashed border-border-subtle p-6 text-center">
            <p className="text-sm text-muted">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover"
            >
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-border-subtle p-6 text-center">
            <Building2 className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-2 text-sm font-bold text-charcoal">
              No properties yet
            </p>
            <p className="mt-1 text-xs text-muted">
              Properties added by owners will appear here.
            </p>
          </div>
        ) : view === "all" ? (
          <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 max-h-[65vh] lg:max-h-none">
            {properties.map((property) => (
              <PropertyRow
                key={property.id}
                property={property}
                selected={selectedId === property.id}
                onSelect={() => setSelectedId(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-rows-3">
            {groups.map((group) => (
              <div
                key={group.label}
                className="flex max-h-[260px] min-h-0 flex-col overflow-hidden rounded-xl border border-border-subtle lg:max-h-none"
              >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-ivory/60 px-3 py-2">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-charcoal">
                    {group.label}
                  </h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-muted">
                    {group.items.length}
                  </span>
                </div>
                <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
                  {group.items.length === 0 ? (
                    <p className="p-3 text-center text-[11px] text-muted">
                      No {group.label.toLowerCase()} properties
                      {applied.q ? " match your search" : " yet"}.
                    </p>
                  ) : (
                    group.items.map((property) => (
                      <PropertyRow
                        key={property.id}
                        property={property}
                        selected={selectedId === property.id}
                        onSelect={() => setSelectedId(property.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </section>
      </div>

      <div className="flex min-h-0 flex-col gap-3 lg:h-full">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold tracking-tight text-charcoal">
            Requests
          </h2>
          <span className="text-[11px] font-semibold text-muted">
            Client enquiries, valuations &amp; site visits
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <RequestsPanel
            onPropertiesChanged={() => setReloadKey((key) => key + 1)}
          />
        </div>
      </div>

      {selected && (
        <PropertySheet
          property={selected}
          onClose={() => setSelectedId(null)}
          onChanged={() => setReloadKey((key) => key + 1)}
        />
      )}

      {adding && (
        <AddPropertyModal
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            setReloadKey((key) => key + 1);
          }}
        />
      )}
    </div>
  );
}

type RequestItem = {
  key: string;
  entityId: string;
  kind: "enquiry" | "valuation" | "site-visit" | "listing";
  title: string;
  name: string;
  mobile: string;
  detail: string;
  status: string;
  createdAt: string;
};

type RequestAction = {
  label: string;
  status: string;
  tone: "primary" | "danger";
};

const KIND_STYLES: Record<RequestItem["kind"], string> = {
  enquiry: "bg-blue-50 text-blue-700",
  valuation: "bg-amber-50 text-amber-700",
  "site-visit": "bg-violet-50 text-violet-700",
  listing: "bg-emerald-50 text-emerald-700",
};

const KIND_LABELS: Record<RequestItem["kind"], string> = {
  enquiry: "Enquiry",
  valuation: "Valuation",
  "site-visit": "Site visit",
  listing: "Listing",
};

function getRequestActions(item: RequestItem): RequestAction[] {
  const actions: RequestAction[] = [];

  if (item.kind === "listing") {
    actions.push({ label: "Accept", status: "active", tone: "primary" });
    actions.push({ label: "Reject", status: "rejected", tone: "danger" });
    return actions;
  }

  if (item.kind === "enquiry") {
    const next: Record<string, string> = {
      new: "contacted",
      contacted: "qualified",
      qualified: "converted",
    };
    const status = next[item.status];
    if (status) {
      actions.push({
        label:
          status === "contacted"
            ? "Mark contacted"
            : status === "qualified"
              ? "Qualify"
              : "Convert",
        status,
        tone: "primary",
      });
    }
    if (item.status !== "lost") {
      actions.push({ label: "Lost", status: "lost", tone: "danger" });
    }
    return actions;
  }

  if (item.kind === "valuation") {
    const next: Record<string, string> = {
      requested: "scheduled",
      scheduled: "completed",
    };
    const status = next[item.status];
    if (status) {
      actions.push({
        label: status === "scheduled" ? "Schedule" : "Complete",
        status,
        tone: "primary",
      });
    }
    return actions;
  }

  const next: Record<string, string> = {
    requested: "confirmed",
    confirmed: "completed",
  };
  const status = next[item.status];
  if (status) {
    actions.push({
      label: status === "confirmed" ? "Confirm" : "Complete",
      status,
      tone: "primary",
    });
  }
  if (item.status !== "cancelled") {
    actions.push({ label: "Cancel", status: "cancelled", tone: "danger" });
  }

  return actions;
}

const REQUEST_STATUS_STYLES: Record<string, string> = {
  new: "border-amber-200 bg-amber-50 text-amber-700",
  contacted: "border-blue-200 bg-blue-50 text-blue-700",
  qualified: "border-violet-200 bg-violet-50 text-violet-700",
  converted: "border-emerald-200 bg-emerald-50 text-emerald-700",
  lost: "border-rose-200 bg-rose-50 text-rose-700",
  requested: "border-amber-200 bg-amber-50 text-amber-700",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-rose-200 bg-rose-50 text-rose-700",
};

function RequestStatusBadge({ status }: { status: string }) {
  const style =
    REQUEST_STATUS_STYLES[status] ??
    "border-border-subtle bg-ivory text-muted";
  const label = status
    .replace(/_/g, " ")
    .replace(/^\w/, (character) => character.toUpperCase());

  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${style}`}
    >
      {label}
    </span>
  );
}

function RequestRow({
  item,
  busy,
  onAction,
  onManage,
}: {
  item: RequestItem;
  busy: boolean;
  onAction: (item: RequestItem, status: string) => void;
  onManage: (item: RequestItem) => void;
}) {
  const actions = getRequestActions(item);

  return (
    <div className="rounded-lg border border-border-subtle p-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${KIND_STYLES[item.kind]}`}
            >
              {KIND_LABELS[item.kind]}
            </span>
            <p className="line-clamp-1 text-xs font-bold text-charcoal">
              {item.title}
            </p>
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
            {item.name} · {item.mobile}
          </p>
          {item.detail && (
            <p className="line-clamp-1 text-[11px] text-muted">{item.detail}</p>
          )}
          <p className="mt-1 text-[10px] font-semibold text-muted-light">
            {formatDateTime(item.createdAt)}
          </p>
        </div>
        <RequestStatusBadge status={item.status} />
      </div>

      {actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={busy}
              onClick={() => onAction(item, action.status)}
              className={`rounded px-2 py-1 text-[10px] font-bold disabled:opacity-50 ${
                action.tone === "primary"
                  ? "bg-gold text-charcoal hover:bg-gold-hover"
                  : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              }`}
            >
              {action.label}
            </button>
          ))}
          {item.kind !== "listing" && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onManage(item)}
              className="rounded border border-border-subtle px-2 py-1 text-[10px] font-bold text-charcoal hover:border-gold/60 disabled:opacity-50"
            >
              Manage
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function RequestsPanel({
  onPropertiesChanged,
}: {
  onPropertiesChanged: () => void;
}) {
  const [view, setView] = useState<ViewMode>("all");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [requests, setRequests] = useState<AdminRealEstateRequests>({
    enquiries: [],
    valuations: [],
    siteVisits: [],
    listings: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [selected, setSelected] = useState<{
    kind: "enquiry" | "valuation" | "site-visit";
    id: string;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdminRealEstateRequests(debounced)
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load requests.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, reloadKey]);

  const items = useMemo<RequestItem[]>(() => {
    const list: RequestItem[] = [];

    for (const item of requests.enquiries) {
      list.push({
        key: `enq-${item.id}`,
        entityId: item.id,
        kind: "enquiry",
        title: item.specificService || "Real Estate enquiry",
        name: item.fullName,
        mobile: item.mobile,
        detail: item.comments || (item.pinCode ? `Pincode ${item.pinCode}` : ""),
        status: item.status,
        createdAt: item.createdAt,
      });
    }

    for (const item of requests.valuations) {
      list.push({
        key: `val-${item.id}`,
        entityId: item.id,
        kind: "valuation",
        title: `${item.propertyType} valuation`,
        name: item.ownerName,
        mobile: item.mobile,
        detail: `${item.location}, ${item.pincode}`,
        status: item.status,
        createdAt: item.createdAt,
      });
    }

    for (const item of requests.siteVisits) {
      list.push({
        key: `sv-${item.id}`,
        entityId: item.id,
        kind: "site-visit",
        title: "Site visit request",
        name: item.clientName,
        mobile: item.mobile,
        detail: `${item.propertyTitle} · ${item.date} · ${item.slot}`,
        status: item.status,
        createdAt: item.createdAt,
      });
    }

    for (const item of requests.listings) {
      list.push({
        key: `lst-${item.id}`,
        entityId: item.id,
        kind: "listing",
        title: item.title,
        name: `${item.bhk} · ${item.propertyType}`,
        mobile: `${item.location} · ${item.pincode}`,
        detail: formatPrice(item.price, item.priceUnit),
        status: item.status,
        createdAt: item.createdAt,
      });
    }

    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [requests]);

  const groups = useMemo(
    () => [
      {
        label: "Enquiries",
        items: items.filter((item) => item.kind === "enquiry"),
      },
      {
        label: "Valuations",
        items: items.filter((item) => item.kind === "valuation"),
      },
      {
        label: "Site Visits",
        items: items.filter((item) => item.kind === "site-visit"),
      },
      {
        label: "Listings",
        items: items.filter((item) => item.kind === "listing"),
      },
    ],
    [items],
  );

  const handleManage = (item: RequestItem) => {
    if (item.kind === "listing") return;
    setSelected({ kind: item.kind, id: item.entityId });
  };

  const handleAction = async (item: RequestItem, status: string) => {
    setBusyKey(item.key);
    setActionError(null);

    try {
      if (item.kind === "listing") {
        await updateAdminProperty(item.entityId, {
          status: status as AdminPropertyStatus,
        });
        onPropertiesChanged();
      } else {
        await updateAdminRequest(
          item.kind as AdminRequestKind,
          item.entityId,
          status,
        );
      }
      setReloadKey((key) => key + 1);
      showToast(
        item.kind === "listing" ? "Listing updated." : "Request updated.",
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not update request.",
      );
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <>
      <section className="flex min-h-0 flex-col rounded-2xl border border-border-subtle bg-white p-4 sm:p-5 lg:h-full">
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-border-subtle bg-ivory p-1">
        {(
          [
            { value: "all", label: "All" },
            { value: "individual", label: "Individual" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setView(tab.value)}
            className={`rounded-lg py-2 text-sm font-bold transition-colors ${
              view === tab.value
                ? "bg-charcoal text-white"
                : "text-charcoal hover:bg-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mt-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, mobile, locality…"
            aria-label="Search requests"
            className="w-full rounded-lg border border-border-subtle bg-white py-2.5 pl-9 pr-3 text-sm text-charcoal outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </div>

        {actionError && (
          <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-[11px] text-rose-700">
            {actionError}
          </p>
        )}

        {loading ? (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border border-border-subtle p-3"
            >
              <div className="h-3 w-2/3 animate-pulse rounded bg-ivory-dark" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-ivory-dark" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-3 space-y-2 rounded-xl border border-dashed border-border-subtle p-6 text-center">
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover"
          >
            Try again
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-border-subtle p-6 text-center">
          <p className="text-sm font-bold text-charcoal">No requests yet</p>
          <p className="mt-1 text-xs text-muted">
            Client enquiries, valuations and site visits will appear here.
          </p>
        </div>
      ) : view === "all" ? (
        <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1 max-h-[65vh] lg:max-h-none">
          {items.map((item) => (
            <RequestRow
              key={item.key}
              item={item}
              busy={busyKey === item.key}
              onAction={handleAction}
              onManage={handleManage}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 lg:grid lg:grid-rows-3">
          {groups.map((group) => (
            <div
              key={group.label}
              className="flex max-h-[260px] min-h-0 flex-col overflow-hidden rounded-xl border border-border-subtle lg:max-h-none"
            >
              <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-subtle bg-ivory/60 px-3 py-2">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-charcoal">
                  {group.label}
                </h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-muted">
                  {group.items.length}
                </span>
              </div>
              <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">
                {group.items.length === 0 ? (
                  <p className="p-3 text-center text-[11px] text-muted">
                    No {group.label.toLowerCase()}
                    {debounced ? " match your search" : " yet"}.
                  </p>
                ) : (
                  group.items.map((item) => (
                    <RequestRow
              key={item.key}
              item={item}
              busy={busyKey === item.key}
              onAction={handleAction}
              onManage={handleManage}
            />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </section>

      {selected && (
        <RequestSheet
          kind={selected.kind}
          id={selected.id}
          enquiries={requests.enquiries}
          valuations={requests.valuations}
          siteVisits={requests.siteVisits}
          onClose={() => setSelected(null)}
          onUpdated={() => setReloadKey((key) => key + 1)}
        />
      )}
    </>
  );
}

function SheetShell({
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 bg-charcoal/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-charcoal">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close request"
            className="shrink-0 rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function RequestSheet({
  kind,
  id,
  enquiries,
  valuations,
  siteVisits,
  onClose,
  onUpdated,
}: {
  kind: "enquiry" | "valuation" | "site-visit";
  id: string;
  enquiries: AdminEnquiry[];
  valuations: AdminValuation[];
  siteVisits: AdminSiteVisit[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  if (kind === "enquiry") {
    const enquiry = enquiries.find((item) => item.id === id);
    return enquiry ? (
      <EnquiryManageSheet
        enquiry={enquiry}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    ) : null;
  }

  if (kind === "valuation") {
    const valuation = valuations.find((item) => item.id === id);
    return valuation ? (
      <ValuationManageSheet
        valuation={valuation}
        onClose={onClose}
        onUpdated={onUpdated}
      />
    ) : null;
  }

  const visit = siteVisits.find((item) => item.id === id);
  return visit ? (
    <SiteVisitManageSheet
      visit={visit}
      onClose={onClose}
      onUpdated={onUpdated}
    />
  ) : null;
}

function EnquiryManageSheet({
  enquiry,
  onClose,
  onUpdated,
}: {
  enquiry: AdminEnquiry;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState(enquiry.status);
  const [priority, setPriority] = useState(enquiry.priority);
  const [assignedTo, setAssignedTo] = useState(enquiry.assignedTo ?? "");
  const [followUpAt, setFollowUpAt] = useState(enquiry.followUpAt ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";
  const labelClass = "mb-1 block text-[11px] font-bold text-charcoal";

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminEnquiry(enquiry.id, {
        status,
        priority,
        assignedTo: assignedTo.trim() || null,
        followUpAt: followUpAt || null,
      });
      showToast("Enquiry updated.");
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save enquiry.");
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addAdminEnquiryNote(enquiry.id, note.trim());
      setNote("");
      showToast("Note added.");
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add note.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Enquiry"
      title={enquiry.fullName}
      subtitle={`${enquiry.specificService || "Real Estate"} · ${enquiry.mobile}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="enq-status">
              Status
            </label>
            <select
              id="enq-status"
              className={inputClass}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {["new", "contacted", "qualified", "converted", "lost"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="enq-priority">
              Priority
            </label>
            <select
              id="enq-priority"
              className={inputClass}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              {["low", "medium", "high"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="enq-assignee">
              Assigned to
            </label>
            <input
              id="enq-assignee"
              className={inputClass}
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              placeholder="Staff name or ID"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="enq-followup">
              Follow-up
            </label>
            <input
              id="enq-followup"
              type="date"
              className={inputClass}
              value={followUpAt}
              onChange={(event) => setFollowUpAt(event.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg bg-ivory p-3 text-xs leading-relaxed text-muted">
          {enquiry.comments || "No comments provided."}
        </div>

        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save enquiry"}
        </button>
      </form>

      <div className="space-y-2 border-t border-border-subtle pt-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-charcoal">
          Notes
        </h3>
        {enquiry.notes.length === 0 ? (
          <p className="text-xs text-muted">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {enquiry.notes.map((item) => (
              <li key={item.id} className="rounded-lg bg-ivory p-2">
                <p className="text-[11px] font-bold text-charcoal">
                  {item.author}
                </p>
                <p className="text-xs text-muted">{item.text}</p>
                <p className="mt-1 text-[10px] text-muted-light">
                  {formatDateTime(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        <textarea
          rows={2}
          className={inputClass}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add a note"
        />
        <button
          type="button"
          onClick={addNote}
          disabled={busy || !note.trim()}
          className="w-full rounded-lg border border-border-subtle px-4 py-2 text-sm font-bold text-charcoal hover:border-gold/60 disabled:opacity-50"
        >
          Add note
        </button>
      </div>
    </SheetShell>
  );
}

function ValuationManageSheet({
  valuation,
  onClose,
  onUpdated,
}: {
  valuation: AdminValuation;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState(valuation.status);
  const [advisor, setAdvisor] = useState(valuation.advisor ?? "");
  const [intent, setIntent] = useState(valuation.intent ?? "");
  const [adminNotes, setAdminNotes] = useState(valuation.adminNotes ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";
  const labelClass = "mb-1 block text-[11px] font-bold text-charcoal";

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminValuation(valuation.id, {
        status,
        advisor: advisor.trim() || null,
        intent: intent === "" ? null : (intent as "rent" | "sale"),
        adminNotes: adminNotes.trim() || null,
      });
      showToast("Valuation updated.");
      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save valuation.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Valuation"
      title={valuation.ownerName}
      subtitle={`${valuation.propertyType} · ${valuation.location}, ${valuation.pincode}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="val-status">
              Status
            </label>
            <select
              id="val-status"
              className={inputClass}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              {["requested", "scheduled", "completed"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="val-intent">
              Rent or sale
            </label>
            <select
              id="val-intent"
              className={inputClass}
              value={intent}
              onChange={(event) => setIntent(event.target.value)}
            >
              <option value="">Not decided</option>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="val-advisor">
            Advisor / consultant
          </label>
          <input
            id="val-advisor"
            className={inputClass}
            value={advisor}
            onChange={(event) => setAdvisor(event.target.value)}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="val-notes">
            Admin notes
          </label>
          <textarea
            id="val-notes"
            rows={3}
            className={inputClass}
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
          />
        </div>

        <div className="rounded-lg bg-ivory p-3 text-xs leading-relaxed text-muted">
          Client notes: {valuation.notes || "None"}
        </div>

        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save valuation"}
        </button>
      </form>
    </SheetShell>
  );
}

function SiteVisitManageSheet({
  visit,
  onClose,
  onUpdated,
}: {
  visit: AdminSiteVisit;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState(visit.status);
  const [date, setDate] = useState(visit.date);
  const [slot, setSlot] = useState(visit.slot);
  const [adviserId, setAdviserId] = useState(visit.adviserId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full rounded-lg border border-border-subtle bg-white px-3 py-2 text-sm text-charcoal outline-none focus:border-gold focus:ring-2 focus:ring-gold/30";
  const labelClass = "mb-1 block text-[11px] font-bold text-charcoal";

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await updateAdminSiteVisit(visit.id, {
        status,
        date,
        slot,
        adviserId: adviserId.trim() || null,
      });
      showToast("Site visit updated.");
      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save site visit.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <SheetShell
      eyebrow="Site visit"
      title={visit.clientName}
      subtitle={`${visit.propertyTitle} · ${visit.mobile}`}
      onClose={onClose}
    >
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className={labelClass} htmlFor="visit-status">
            Status
          </label>
          <select
            id="visit-status"
            className={inputClass}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {["requested", "confirmed", "completed", "cancelled"].map(
              (option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="visit-date">
              Date
            </label>
            <input
              id="visit-date"
              type="date"
              className={inputClass}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="visit-slot">
              Slot
            </label>
            <input
              id="visit-slot"
              className={inputClass}
              value={slot}
              onChange={(event) => setSlot(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="visit-adviser">
            Adviser
          </label>
          <input
            id="visit-adviser"
            className={inputClass}
            value={adviserId}
            onChange={(event) => setAdviserId(event.target.value)}
          />
        </div>

        {error && <p className="text-[11px] text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-gold px-4 py-2 text-sm font-bold text-charcoal hover:bg-gold-hover disabled:opacity-50"
        >
          {busy ? "Saving..." : "Save site visit"}
        </button>
      </form>
    </SheetShell>
  );
}
