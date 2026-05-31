export interface PersonaData {
  fullName: string;
  documentNumber: string;
  address: string;
}

export interface ClientLookupResult extends PersonaData {
  id: number;
}

export type ClientType = "Comunero" | "Tercero";

export interface Client {
  id: number;
  fullName: string;
  documentNumber: string;
  address: string | null;
  phone: string | null;
  clientType: ClientType;
  nro_licence: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPayload {
  fullName: string;
  documentNumber: string;
  address: string;
  phone: string;
  clientType: ClientType;
}
