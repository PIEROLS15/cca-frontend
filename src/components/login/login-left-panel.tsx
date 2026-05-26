import Image from "next/image";
import { Sparkles } from "lucide-react";
import { featuresData } from "@/data/features";

export function LoginLeftPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-sidebar text-sidebar-foreground">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-info/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-success/20 blur-3xl" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10">
        <Image
          src="/images/logo.png"
          alt="Comunidad Campesina de Asia"
          width={200}
          height={80}
          className="h-20 w-auto drop-shadow-lg"
        />
      </div>

      <div className="relative z-10 space-y-6 max-w-lg">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sidebar-accent/50 border border-sidebar-border text-xs">
          <Sparkles className="h-3 w-3 text-primary" />
          Sistema de gestión comunal
        </div>
        <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.1]">
          Plataforma integral para gestión comunal y administración de
          certificados.
        </h1>
        <p className="text-sidebar-foreground/70 text-lg leading-relaxed">
          Administra certificados, comuneros, sectores y solicitudes en un solo
          lugar — con la transparencia y agilidad que tu comunidad merece.
        </p>
      </div>

      <div className="relative z-10 space-y-4">
        {featuresData.map((f) => (
          <div
            key={f.title}
            className="flex gap-3 p-3 rounded-xl bg-sidebar-accent/40 border border-sidebar-border"
          >
            <div className="p-2 rounded-lg bg-sidebar-accent/50 shrink-0">
              {f.icon}
            </div>
            <div>
              <h3 className="font-medium text-sm">{f.title}</h3>
              <p className="text-xs text-sidebar-foreground/60">
                {f.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 text-xs text-sidebar-foreground/50">
        &copy; {new Date().getFullYear()} Comunidad Campesina de Asia
      </div>
    </div>
  );
}
