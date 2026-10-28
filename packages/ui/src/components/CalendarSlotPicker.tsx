import { useMemo } from "react";
import { CalendarDays, Clock } from "lucide-react";

export interface SlotValue {
  date: string;
  slot: string;
}

interface CalendarSlotPickerProps {
  value: SlotValue | null;
  onChange: (value: SlotValue) => void;
  days?: number;
  slots?: string[];
  className?: string;
}

const DEFAULT_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "01:00 PM",
  "03:00 PM",
  "04:30 PM",
  "06:00 PM",
];

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function CalendarSlotPicker({
  value,
  onChange,
  days = 7,
  slots = DEFAULT_SLOTS,
  className = "",
}: CalendarSlotPickerProps) {
  const dates = useMemo(
    () =>
      Array.from({ length: days }).map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return {
          id: isoDate(date),
          weekday: date.toLocaleDateString("en-IN", { weekday: "short" }),
          day: String(date.getDate()).padStart(2, "0"),
          month: date.toLocaleDateString("en-IN", { month: "short" }),
        };
      }),
    [days]
  );

  const selectedDate = value?.date ?? null;
  const selectedSlot = value?.slot ?? null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <p className="flex items-center gap-1.5 text-xs font-bold text-charcoal mb-2">
          <CalendarDays className="w-3.5 h-3.5 text-gold" />
          Pick a date
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dates.map((date) => {
            const active = selectedDate === date.id;
            return (
              <button
                key={date.id}
                type="button"
                onClick={() =>
                  onChange({
                    date: date.id,
                    slot: active ? (selectedSlot ?? "") : "",
                  })
                }
                className={`w-16 shrink-0 rounded-xl border px-2 py-2 text-center transition-colors cursor-pointer ${
                  active
                    ? "bg-charcoal border-charcoal text-white"
                    : "bg-white border-border-subtle text-charcoal hover:border-gold/60"
                }`}
              >
                <span
                  className={`block text-[10px] font-bold uppercase tracking-wider ${
                    active ? "text-ivory/60" : "text-muted-light"
                  }`}
                >
                  {date.weekday}
                </span>
                <span className="block text-base font-extrabold leading-tight">
                  {date.day}
                </span>
                <span
                  className={`block text-[10px] ${active ? "text-ivory/60" : "text-muted"}`}
                >
                  {date.month}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="flex items-center gap-1.5 text-xs font-bold text-charcoal mb-2">
          <Clock className="w-3.5 h-3.5 text-gold" />
          Pick a time slot
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {slots.map((slot) => {
            const active = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                disabled={!selectedDate}
                onClick={() => selectedDate && onChange({ date: selectedDate, slot })}
                className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                  active
                    ? "bg-gold border-gold text-charcoal"
                    : selectedDate
                      ? "bg-white border-border-subtle text-charcoal-light hover:border-gold/60 cursor-pointer"
                      : "bg-ivory border-border-subtle text-muted-light cursor-not-allowed"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
        {!selectedDate && (
          <p className="mt-2 text-[11px] text-muted-light">
            Choose a date to see available slots.
          </p>
        )}
      </div>
    </div>
  );
}
