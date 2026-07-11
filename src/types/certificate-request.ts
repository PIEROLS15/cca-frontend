export interface CertificateRequestPerson {
  id?: number | null;
  searchType: string;
  fullName: string;
  documentNumber: string;
  clientCode?: string | null;
  address: string;
  nro_licence?: string | null;
}

export interface CertificateRequestCertificateType {
  type: string;
  otherType?: string;
}

export interface CertificateRequestAttachment {
  type: string;
  phoneNumber?: string;
}

export interface CertificateRequestCreatedBy {
  dni: string;
  role: string;
}

export type CertificateRequestStatus = "En Proceso" | "Observado" | "Recepcionado";

export interface CertificateRequest {
  id: number;
  requestNumber: string;
  isComunero: boolean;
  destination: string;
  requestDescription: string;
  sectorLocation: string;
  client: CertificateRequestPerson;
  partnerClient: CertificateRequestPerson;
  certificateTypes: CertificateRequestCertificateType[];
  exposure: string;
  attachments: CertificateRequestAttachment[];
  status: CertificateRequestStatus;
  createdBy: CertificateRequestCreatedBy;
  legacyPayload?: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateRequestPayload {
  isComunero: boolean;
  destination: string;
  requestDescription: string;
  sectorLocation: string;
  client: CertificateRequestPerson;
  partnerClient: CertificateRequestPerson;
  certificateTypes: CertificateRequestCertificateType[];
  exposure: string;
  attachments: CertificateRequestAttachment[];
}

export interface CertificateRequestStatusPayload {
  status: CertificateRequestStatus;
}
