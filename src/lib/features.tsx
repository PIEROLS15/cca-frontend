import { FileCheck, Users, Building2 } from "lucide-react";
import type { ReactNode } from "react";

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

export const featuresData: Feature[] = [
  {
    icon: <FileCheck className="h-5 w-5 text-primary" />,
    title: "Certificados digitales",
    description: "Emisión y seguimiento de certificados en línea",
  },
  {
    icon: <Users className="h-5 w-5 text-emerald-500" />,
    title: "Gestión de comuneros",
    description: "Padrón actualizado con toda la información",
  },
  {
    icon: <Building2 className="h-5 w-5 text-amber-500" />,
    title: "Sectores y predios",
    description: "Administración territorial eficiente",
  },
];
