export type FeatureIconKey = "file-check" | "users" | "building-2";

export interface FeatureData {
  icon: FeatureIconKey;
  title: string;
  description: string;
}

export const featuresData: FeatureData[] = [
  {
    icon: "file-check",
    title: "Certificados digitales",
    description: "Emisión y seguimiento de certificados en línea",
  },
  {
    icon: "users",
    title: "Gestión de comuneros",
    description: "Padrón actualizado con toda la información",
  },
  {
    icon: "building-2",
    title: "Sectores y predios",
    description: "Administración territorial eficiente",
  },
];
