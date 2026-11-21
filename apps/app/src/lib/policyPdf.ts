import { GState, jsPDF } from "jspdf";
import type { PolicyRecord } from "@kaundinya/config";
import { BRAND_MARK_URL } from "./brand";
import { statusLabel } from "./status";

const GOLD: [number, number, number] = [245, 185, 0];
const CHARCOAL: [number, number, number] = [23, 23, 23];
const MUTED: [number, number, number] = [104, 104, 104];
const SUBTLE: [number, number, number] = [158, 155, 147];
const BORDER: [number, number, number] = [229, 223, 209];
const SURFACE_MUTED: [number, number, number] = [247, 244, 236];
const BRAND_SOFT: [number, number, number] = [254, 249, 232];
const BRAND_STRONG: [number, number, number] = [138, 107, 26];

type LoadedImage = {
  dataUrl: string;
  grayDataUrl: string;
  width: number;
  height: number;
};

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image failed to load."));
    image.src = src;
  });
}

async function loadPng(url: string): Promise<LoadedImage | null> {
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await loadImageElement(objectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.drawImage(image, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = pixels.data;
      for (let index = 0; index < data.length; index += 4) {
        const luma = Math.round(
          data[index] * 0.299 +
            data[index + 1] * 0.587 +
            data[index + 2] * 0.114
        );
        data[index] = luma;
        data[index + 1] = luma;
        data[index + 2] = luma;
      }
      context.putImageData(pixels, 0, 0);

      return {
        dataUrl,
        grayDataUrl: canvas.toDataURL("image/png"),
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return null;
  }
}

function money(value: number) {
  return `INR ${Math.round(value || 0).toLocaleString("en-IN")}`;
}

function dateText(iso?: string | null) {
  if (!iso) return "Not recorded";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso: string) {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now.getTime()) / (1000 * 60 * 60 * 24));
}

function renewalText(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"}`;
  }
  if (days === 0) return "Renews today";
  return `Renews in ${days} day${days === 1 ? "" : "s"}`;
}

export async function downloadPolicyPdf(
  policy: PolicyRecord,
  client: { name?: string | null; mobile?: string | null } = {}
) {
  const mark = await loadPng(BRAND_MARK_URL);
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  if (mark) {
    const width = 340;
    const height = (mark.height / mark.width) * width;
    doc.setGState(new GState({ opacity: 0.06 }));
    doc.addImage(
      mark.grayDataUrl,
      "PNG",
      (pageWidth - width) / 2,
      (pageHeight - height) / 2,
      width,
      height
    );
    doc.setGState(new GState({ opacity: 1 }));
  }

  let headerTextX = margin;
  if (mark) {
    const logoHeight = 34;
    const logoWidth = (mark.width / mark.height) * logoHeight;
    doc.addImage(mark.dataUrl, "PNG", margin, 44, logoWidth, logoHeight);
    headerTextX = margin + logoWidth + 12;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...CHARCOAL);
  doc.text("KAUNDINYA CONSULTANCY", headerTextX, 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("Insurance and advisory services", headerTextX, 73);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...CHARCOAL);
  doc.text("POLICY DOCUMENT", pageWidth - margin, 58, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(
    `Generated ${dateText(new Date().toISOString().slice(0, 10))}`,
    pageWidth - margin,
    71,
    { align: "right" }
  );

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.line(margin, 90, pageWidth - margin, 90);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...CHARCOAL);
  doc.text(policy.provider || "Insurance policy", margin, 126);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Policy no. ${policy.policyNumber || "Not recorded"}`, margin, 142);

  const status = statusLabel(policy.status).toUpperCase();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const pillWidth = doc.getTextWidth(status) + 24;
  doc.setFillColor(...BRAND_SOFT);
  doc.roundedRect(
    pageWidth - margin - pillWidth,
    110,
    pillWidth,
    20,
    10,
    10,
    "F"
  );
  doc.setTextColor(...BRAND_STRONG);
  doc.text(status, pageWidth - margin - pillWidth / 2, 123, { align: "center" });

  doc.setFillColor(...SURFACE_MUTED);
  doc.roundedRect(margin, 168, contentWidth, 58, 8, 8, "F");

  const label = (text: string, x: number, y: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(text, x, y, { charSpace: 0.6 });
  };
  const value = (text: string, x: number, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...CHARCOAL);
    doc.text(text, x, y);
  };

  const columnSplit = margin + contentWidth / 2;
  const coverLabel =
    policy.type === "Motor"
      ? "COVER / IDV"
      : policy.type === "Life & Term"
        ? "SUM ASSURED"
        : "SUM INSURED";
  label(coverLabel, margin + 16, 188);
  value(money(policy.coverAmount), margin + 16, 210);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.8);
  doc.line(columnSplit, 180, columnSplit, 214);
  label("PREMIUM PAID", columnSplit + 16, 188);
  value(money(policy.premium), columnSplit + 16, 210);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...SUBTLE);
  doc.text("POLICY DETAILS", margin, 254, { charSpace: 1 });
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.6);
  doc.line(margin, 260, pageWidth - margin, 260);

  const fields: Array<[string, string]> = [
    ["INSURER", policy.provider || "—"],
    ["POLICY NUMBER", policy.policyNumber || "—"],
    ["CATEGORY", policy.type || "—"],
    ["STATUS", statusLabel(policy.status)],
    ["POLICYHOLDER", policy.holder || client.name || "—"],
    ["CLIENT MOBILE", client.mobile || "—"],
    ["SERIAL NO.", policy.serialNo ? `#${policy.serialNo}` : "—"],
  ];

  if (policy.type === "Motor" && policy.vehicleType) {
    fields.push([
      "VEHICLE",
      policy.vehicleType === "2W" ? "Two-wheeler" : "Four-wheeler",
    ]);
  }

  fields.push(
    ["START DATE", dateText(policy.validFrom)],
    ["END DATE", dateText(policy.renewalDate)]
  );

  const fieldWidth = contentWidth / 2;
  const totalRows = Math.ceil(fields.length / 2);
  fields.forEach(([fieldLabel, fieldValue], index) => {
    const row = Math.floor(index / 2);
    const column = index % 2;
    const x = margin + column * fieldWidth;
    const y = 282 + row * 46;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...SUBTLE);
    doc.text(fieldLabel, x, y, { charSpace: 0.5 });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...CHARCOAL);
    doc.text(fieldValue, x, y + 15);

    if (row < totalRows - 1) {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.5);
      doc.line(x, y + 26, x + fieldWidth - 16, y + 26);
    }
  });

  const renewalY = 282 + totalRows * 46;
  doc.setFillColor(...BRAND_SOFT);
  doc.roundedRect(margin, renewalY, contentWidth, 46, 8, 8, "F");
  doc.setFillColor(...GOLD);
  doc.roundedRect(margin, renewalY, 4, 46, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...BRAND_STRONG);
  doc.text("RENEWAL", margin + 18, renewalY + 17, { charSpace: 0.8 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...CHARCOAL);
  doc.text(
    `${dateText(policy.renewalDate)}  ·  ${renewalText(policy.renewalDate)}`,
    margin + 18,
    renewalY + 33
  );

  const footerY = pageHeight - 58;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.6);
  doc.line(margin, footerY - 12, pageWidth - margin, footerY - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  const disclaimer = doc.splitTextToSize(
    "This is a computer-generated policy summary issued by Kaundinya Consultancy. It is watermarked for client use only. For claims, endorsements or corrections, contact your assigned consultant.",
    contentWidth - 70
  ) as string[];
  doc.text(disclaimer, margin, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...SUBTLE);
  doc.text("Page 1 of 1", pageWidth - margin, footerY, { align: "right" });

  const base =
    (policy.policyNumber || policy.provider || "policy")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || "policy";
  doc.save(`${base}.pdf`);
}
