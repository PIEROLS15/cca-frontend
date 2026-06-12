export interface AssemblyRecordAttachment {
  type: string;
}

export interface AssemblyRecordRequest {
  id: number;
  code: string;
  typeUser: string;
  clientId: number;
  certificateId: number;
  userId: number | null;
  description: string | null;
  buyerFullName: string | null;
  sellerFullName: string | null;
  sectorLocation: string | null;
  terrainType: string | null;
  awardDate: string | null;
  possessionTime: string | null;
  email: string | null;
  phone: string | null;
  attachments: AssemblyRecordAttachment[];
  legacyPayload?: unknown | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: number;
    fullName: string;
    documentNumber: string;
    commoner?: { id: number; licenseSequence: number | null } | null;
  };
  certificate: {
    id: number;
    certificateNumber: string;
  };
  user: {
    id: number;
    fullName: string;
  } | null;
}

export interface AssemblyRecordRequestPayload {
  certificateId: number;
  clientId?: number;
  description?: string;
  buyerFullName?: string;
  sellerFullName?: string;
  sectorLocation?: string;
  terrainType?: string;
  awardDate?: string;
  possessionTime?: string;
  email?: string;
  phone?: string;
  attachments?: AssemblyRecordAttachment[];
}

export interface AssemblyRecordRequestUpdatePayload {
  clientId?: number;
  certificateId?: number;
  description?: string;
  buyerFullName?: string;
  sellerFullName?: string;
  sectorLocation?: string;
  terrainType?: string;
  awardDate?: string;
  possessionTime?: string;
  email?: string;
  phone?: string;
  attachments?: AssemblyRecordAttachment[];
}
