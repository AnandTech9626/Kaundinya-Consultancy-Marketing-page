import { MapPin } from "lucide-react";
import { FormField } from "./FormField";
import { Input } from "./Input";

interface PincodeInputProps {
  value: string;
  onChange: (value: string) => void;
  locality?: string;
  onLocalityChange?: (value: string) => void;
  label?: string;
  localityLabel?: string;
  className?: string;
}

export function PincodeInput({
  value,
  onChange,
  locality,
  onLocalityChange,
  label = "Pincode",
  localityLabel = "Area / locality",
  className = "",
}: PincodeInputProps) {
  const invalid = value.length > 0 && value.length < 6;
  const complete = /^\d{6}$/.test(value);
  const inServiceArea = complete && /^50[0-2]\d{3}$/.test(value);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={onLocalityChange ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : ""}>
        <FormField label={label} htmlFor="pincode" error={invalid ? "Enter a 6-digit pincode" : undefined}>
          <Input
            id="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="500081"
            value={value}
            invalid={invalid}
            onChange={(event) =>
              onChange(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
        </FormField>

        {onLocalityChange && (
          <FormField label={localityLabel} htmlFor="locality">
            <Input
              id="locality"
              placeholder="e.g. Gachibowli"
              value={locality ?? ""}
              onChange={(event) => onLocalityChange(event.target.value)}
            />
          </FormField>
        )}
      </div>

      {complete && (
        <p
          className={`flex items-center gap-1.5 text-[11px] ${
            inServiceArea ? "text-emerald-700" : "text-muted"
          }`}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {inServiceArea
            ? "Within our Hyderabad service area."
            : "We'll confirm coverage for this pincode when we call you."}
        </p>
      )}
    </div>
  );
}
