export interface DashboardSummary {
  certificates: number;
  clients: number;
  terrainTypes: number;
  sectors: number;
}

export interface StatusBreakdownItem {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyActivityItem {
  mes: string;
  certificados: number;
  solicitudesCert: number;
  solicitudesActa: number;
}

export interface RecentActivityItem {
  id: string;
  usuario: string;
  accion: string;
  cuando: string;
}
