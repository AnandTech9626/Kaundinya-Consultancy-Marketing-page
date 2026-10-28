export interface PillOption {
  value: string;
  label: string;
  hint?: string;
}

interface PillSelectProps {
  options: (string | PillOption)[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  label?: string;
  className?: string;
}

export function PillSelect({
  options,
  value,
  onChange,
  multiple = true,
  label,
  className = "",
}: PillSelectProps) {
  const normalized: PillOption[] = options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option
  );

  const toggle = (option: string) => {
    if (!multiple) {
      onChange(value[0] === option ? [] : [option]);
      return;
    }
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option]
    );
  };

  return (
    <div className={className}>
      {label && (
        <p className="text-xs font-bold text-charcoal mb-1.5">{label}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {normalized.map((option) => {
          const selected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(option.value)}
              title={option.hint}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                selected
                  ? "bg-gold border-gold text-charcoal"
                  : "bg-white border-border-subtle text-charcoal-light hover:border-gold/60"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
