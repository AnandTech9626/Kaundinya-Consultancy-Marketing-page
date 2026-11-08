export type BankBrand = {
  logo: string | null;
  short: string;
  background: string;
  foreground: string;
};

type BrandEntry = BankBrand & { aliases: string[] };

const BRANDS: BrandEntry[] = [
  {
    aliases: ["sbi", "statebank", "statebankofindia"],
    logo: "/banks/sbi.svg",
    short: "SBI",
    background: "#e8f0fb",
    foreground: "#22409a",
  },
  {
    aliases: ["hdfc", "hdfcbank"],
    logo: "/banks/hdfc.svg",
    short: "HDFC",
    background: "#eaf1fb",
    foreground: "#004c8f",
  },
  {
    aliases: ["icici", "icicibank"],
    logo: "/banks/icici.svg",
    short: "ICICI",
    background: "#fdecec",
    foreground: "#ae282e",
  },
  {
    aliases: ["axis", "axisbank"],
    logo: "/banks/axis.svg",
    short: "AXIS",
    background: "#fdeff0",
    foreground: "#97144d",
  },
  {
    aliases: ["canara", "canarabank"],
    logo: "/banks/canara.svg",
    short: "CB",
    background: "#eef6fb",
    foreground: "#00629b",
  },
  {
    aliases: ["pnb", "punjabnationalbank"],
    logo: "/banks/pnb.svg",
    short: "PNB",
    background: "#fdeceb",
    foreground: "#a41e22",
  },
  {
    aliases: ["bob", "bankofbaroda", "baroda"],
    logo: "/banks/bob.png",
    short: "BOB",
    background: "#fff2e8",
    foreground: "#f15a22",
  },
  {
    aliases: ["idfc", "idfcfirst", "idfcfirstbank"],
    logo: "/banks/idfc-first.svg",
    short: "IDFC",
    background: "#fdeceb",
    foreground: "#9e1b32",
  },
  {
    aliases: ["yes", "yesbank"],
    logo: "/banks/yes-bank.svg",
    short: "YES",
    background: "#e8f3ff",
    foreground: "#0056a2",
  },
  {
    aliases: ["bajaj", "bajajfinserv", "bajajfinance"],
    logo: "/banks/bajaj-finserv.svg",
    short: "BF",
    background: "#eef3fb",
    foreground: "#1c4f9c",
  },
];

function normalizeBankName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function initials(value: string): string {
  const words = value
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 0 &&
        !["bank", "ltd", "limited", "pvt", "of", "the"].includes(
          word.toLowerCase()
        )
    );
  if (words.length === 0) return "BN";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function bankBrand(bankName: string): BankBrand {
  const normalized = normalizeBankName(bankName ?? "");
  const match = BRANDS.find((entry) => entry.aliases.includes(normalized));
  if (match) {
    return {
      logo: match.logo,
      short: match.short,
      background: match.background,
      foreground: match.foreground,
    };
  }
  return {
    logo: null,
    short: initials(bankName ?? ""),
    background: "#eef2f7",
    foreground: "#475569",
  };
}
