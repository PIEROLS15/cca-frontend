import type { CertificateVerificationSnapshot } from "@/types/certificate-verification";

export interface CertificateVerificationFieldRow {
  label: string;
  value: string;
}

export function formatMeasure(value: number | null) {
  if (value === null || value === undefined) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function displayTerrainMeasure(data: CertificateVerificationSnapshot) {
  const additionalMeasure =
    data.additionalWidth != null && data.additionalLength != null
      ? ` + ${formatMeasure(data.additionalWidth)} x ${formatMeasure(data.additionalLength)} m`
      : "";

  if (data.measurementModeUsed === "AREA_PERIMETER") {
    const area = data.area != null ? formatMeasure(data.area) : null;
    const perimeter = data.perimeter != null ? formatMeasure(data.perimeter) : null;
    if (area && perimeter) return `${area} / ${perimeter}${additionalMeasure}`;
    if (area) return `${area}${additionalMeasure}`;
    if (perimeter) return `${perimeter}${additionalMeasure}`;
  }

  if (data.measurementModeUsed === "MANUAL_TOTAL_AREA") {
    if (data.totalArea != null) return `${formatMeasure(data.totalArea)}${additionalMeasure}`;
  }

  if (data.width != null && data.length != null) {
    let value = `${formatMeasure(data.width)} x ${formatMeasure(data.length)}`;
    if (data.totalArea != null) {
      value += ` | ${formatMeasure(data.totalArea)}`;
    }
    return `${value}${additionalMeasure}`;
  }

  if (data.totalArea != null) {
    return `${formatMeasure(data.totalArea)}${additionalMeasure}`;
  }

  return "—";
}

export function buildTerrainMeasureRows(data: CertificateVerificationSnapshot): CertificateVerificationFieldRow[] {
  const rows: CertificateVerificationFieldRow[] = [];

  if (data.measurementModeUsed === "AREA_PERIMETER") {
    if (data.area != null) rows.push({ label: "Área", value: formatMeasure(data.area) });
    if (data.perimeter != null) rows.push({ label: "Perímetro", value: formatMeasure(data.perimeter) });
  } else if (data.measurementModeUsed === "MANUAL_TOTAL_AREA") {
    if (data.totalArea != null) rows.push({ label: "Área total", value: formatMeasure(data.totalArea) });
  } else {
    if (data.width != null) rows.push({ label: "Ancho", value: formatMeasure(data.width) });
    if (data.length != null) rows.push({ label: "Largo", value: formatMeasure(data.length) });
    if (data.totalArea != null) rows.push({ label: "Área total", value: formatMeasure(data.totalArea) });
  }

  if (data.additionalWidth != null && data.additionalLength != null) {
    rows.push({
      label: "Medida adicional",
      value: `${formatMeasure(data.additionalWidth)} x ${formatMeasure(data.additionalLength)}`,
    });
  }

  return rows;
}

export function formatCertificateDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const month = new Intl.DateTimeFormat("es-PE", { month: "long" }).format(date).toLowerCase();
  return `${date.getDate()} ${month} ${date.getFullYear()}`;
}
