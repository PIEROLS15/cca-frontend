export interface AssemblyRecordRequest {
  id: number;
  code: string;
  clientId: number;
  certificateId: number;
  userId: number | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: number;
    fullName: string;
    documentNumber: string;
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
  clientId: number;
  certificateId: number;
  description?: string;
}

export interface AssemblyRecordRequestUpdatePayload {
  description?: string;
}
