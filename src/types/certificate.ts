export type CertificateStatus = "Por Firmar" | "Por Recoger" | "Entregado";

import type { TerrainMeasurementMode, TerrainType } from "./terrain-type";

export interface CertificateOwner {
  id: number;
  fullName: string;
  documentNumber: string;
  order?: number | null;
  source?: string | null;
}

export interface CertificateTerrain {
  terrainType: TerrainType | null;
  width: number | null;
  length: number | null;
  totalArea: number | null;
  area: number | null;
  perimeter: number | null;
  additionalWidth: number | null;
  additionalLength: number | null;
  measurementModeUsed: TerrainMeasurementMode;
}

export interface CertificateLocation {
  sectors: { id: number; name: string } | null;
  mz: string | null;
  lot: string | null;
}

export interface CertificateBorders {
  north: string | null;
  south: string | null;
  east: string | null;
  west: string | null;
}

export interface CertificateCreatedBy {
  dni: string;
  role: string;
}

export interface Certificate {
  id: number;
  verificationToken?: string | null;
  certificateRequestId: number | null;
  owners: CertificateOwner[];
  terrain: CertificateTerrain;
  location: CertificateLocation;
  borders: CertificateBorders;
  certificateNumber: string;
  requestNumber: string | null;
  additionalNotes: string | null;
  legacyPayload?: unknown | null;
  issuedSnapshot?: unknown | null;
  status: CertificateStatus;
  createdBy: CertificateCreatedBy;
  createdAt: string;
  updatedAt: string;
}

export interface CertificatePayload {
  owners: {
    id?: number | null;
    fullName: string;
    documentNumber: string;
  }[];
  requestNumber: string;
  certificateRequestId?: number | null;
  terrain: {
    terrainType: { id: number };
    width?: number | null;
    length?: number | null;
    totalArea?: number | null;
    area?: number | null;
    perimeter?: number | null;
    additionalWidth?: number | null;
    additionalLength?: number | null;
    measurementModeUsed?: TerrainMeasurementMode;
  };
  location: {
    sectors: { id: number };
    mz?: string | null;
    lot?: string | null;
  };
  borders: {
    north?: string | null;
    south?: string | null;
    east?: string | null;
    west?: string | null;
  };
  additionalNotes?: string | null;
  status?: CertificateStatus;
}
