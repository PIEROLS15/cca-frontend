export interface PersonaData {
  fullName: string;
  documentNumber: string;
  clientCode?: string | null;
  address: string;
}

export interface ClientLookupResult extends PersonaData {
  id: number;
}

export type ClientType = "Comunero" | "Tercero";

export interface Client {
  id: number;
  fullName: string;
  documentNumber: string | null;
  clientCode: string | null;
  address: string | null;
  phone: string | null;
  clientType: ClientType;
  nro_licence: string | null;
  licenseSequence: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPayload {
  fullName: string;
  documentNumber: string;
  address: string;
  phone: string;
  clientType: ClientType;
  licenseSequence?: string;
  noDocument: boolean;
}
