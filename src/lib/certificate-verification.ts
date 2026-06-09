import type { CertificateVerificationSnapshot } from "@/types/certificate-verification";

export function formatMeasure(value: number | null) {
  if (value === null || value === undefined) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function displayTerrainMeasure(data: CertificateVerificationSnapshot) {
  if (data.width != null && data.length != null) {
    return `${formatMeasure(data.width)} x ${formatMeasure(data.length)} m`;
  }

  if (data.totalArea != null) {
    return `${formatMeasure(data.totalArea)} m²`;
  }

  return "—";
}

export function formatCertificateDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const month = new Intl.DateTimeFormat("es-PE", { month: "long" }).format(date).toLowerCase();
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}
