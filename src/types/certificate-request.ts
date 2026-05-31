export interface CertificateRequestPerson {
  id?: number | null;
  searchType: string;
  fullName: string;
  documentNumber: string;
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
  createdBy: CertificateRequestCreatedBy;
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
