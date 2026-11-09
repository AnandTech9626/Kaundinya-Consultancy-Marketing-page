export type InsurerBrand = {
  short: string;
  background: string;
  foreground: string;
};

type Entry = InsurerBrand & { aliases: string[] };

const BRANDS: Entry[] = [
  {
    aliases: ["hdfclife", "hdfcstandardlife"],
    short: "HDFC",
    background: "#e8f1fb",
    foreground: "#004c8f",
  },
  {
    aliases: ["maxlife"],
    short: "MAX",
    background: "#fdecec",
    foreground: "#c8102e",
  },
  {
    aliases: ["starhealth", "starhealthallied"],
    short: "STAR",
    background: "#fff3e6",
    foreground: "#d96b00",
  },
  {
    aliases: ["nivabupa", "bupa"],
    short: "NIVA",
    background: "#e8f4fd",
    foreground: "#0072bc",
  },
  {
    aliases: ["carehealth", "care"],
    short: "CARE",
    background: "#e8f7ee",
    foreground: "#00874a",
  },
  {
    aliases: ["icicilombard", "icici"],
    short: "ICICI",
    background: "#fdecec",
    foreground: "#ae282e",
  },
  {
    aliases: ["bajajallianz", "bajaj"],
    short: "BAJAJ",
    background: "#e9f1fb",
    foreground: "#0b5cad",
  },
  {
    aliases: ["sbigeneral", "sbi"],
    short: "SBI",
    background: "#e8f0fb",
    foreground: "#22409a",
  },
  {
    aliases: ["newindia", "newindiaassurance"],
    short: "NIA",
    background: "#eaf3fb",
    foreground: "#0a4e9b",
  },
  {
    aliases: ["tataaig", "tata"],
    short: "TATA",
    background: "#eaf0fb",
    foreground: "#486aae",
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function initials(value: string): string {
  const words = value
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);
  if (words.length === 0) return "IN";
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function insurerBrand(insurer: string): InsurerBrand {
  const normalized = normalize(insurer ?? "");
  const match = BRANDS.find((entry) => entry.aliases.includes(normalized));
  if (match) {
    return {
      short: match.short,
      background: match.background,
      foreground: match.foreground,
    };
  }
  return {
    short: initials(insurer ?? ""),
    background: "#eef2f7",
    foreground: "#475569",
  };
}

export const INSURANCE_TYPE_LABELS: Record<string, string> = {
  life: "Life & Term",
  health: "Health & Family",
  motor: "Motor",
  property: "Property",
};
