export interface CertificateVerificationBorders {
  north: string | null;
  south: string | null;
  east: string | null;
  west: string | null;
}

export interface CertificateVerificationSnapshot {
  certificateNumber: string;
  clientName: string;
  clientDocuments: string;
  terrainType: string;
  sector: string;
  width: number | null;
  length: number | null;
  totalArea: number | null;
  area: number | null;
  perimeter: number | null;
  additionalWidth: number | null;
  additionalLength: number | null;
  mz: string | null;
  lot: string | null;
  createdAt: string | null;
  borders: CertificateVerificationBorders;
}

export interface CertificateVerificationDifference {
  field: string;
  label: string;
  issued: unknown;
  current: unknown;
}

export interface CertificateVerificationResponse {
  verificationToken: string | null;
  isValid: boolean;
  certificate: CertificateVerificationSnapshot;
  issuedSnapshot: CertificateVerificationSnapshot;
  differences: CertificateVerificationDifference[];
}
