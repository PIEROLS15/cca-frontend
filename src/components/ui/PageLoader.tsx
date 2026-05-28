import Image from "next/image";

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
        <Image
          src="/images/logo_2.png"
          alt="Cargando..."
          width={64}
          height={64}
          className="h-14 w-auto"
          priority
        />
      </div>
    </div>
  );
}
