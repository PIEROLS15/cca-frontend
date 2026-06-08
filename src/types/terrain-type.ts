export type TerrainMeasurementMode = "RECTANGULAR_AUTO" | "AREA_PERIMETER" | "MANUAL_TOTAL_AREA";

export interface TerrainTypeConfig {
  id: number;
  key: string;
  label: string;
  formMode: TerrainMeasurementMode;
  showMzLot: boolean;
  allowAdditionalMeasure: boolean;
  allowAreaPerimeterToggle: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TerrainType {
  id: number;
  name: string;
  terrainTypeConfigId: number | null;
  config: TerrainTypeConfig | null;
  createdAt: string;
  updatedAt: string;
}
