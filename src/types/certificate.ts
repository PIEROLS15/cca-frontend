export type CertificateStatus = "Por Firmar" | "Por Recoger" | "Entregado";

export interface CertificateOwner {
  id: number;
  fullName: string;
  documentNumber: string;
}

export interface CertificateTerrain {
  terrainType: { id: number; name: string } | null;
  width: number | null;
  length: number | null;
  totalArea: number | null;
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
  owners: CertificateOwner[];
  terrain: CertificateTerrain;
  location: CertificateLocation;
  borders: CertificateBorders;
  certificateNumber: string;
  requestNumber: string | null;
  status: CertificateStatus;
  createdBy: CertificateCreatedBy;
  createdAt: string;
  updatedAt: string;
}

export interface CertificatePayload {
  owners: { id: number }[];
  requestNumber: string;
  terrain: {
    terrainType: { id: number };
    width?: number | null;
    length?: number | null;
    totalArea?: number | null;
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
  status?: CertificateStatus;
}
