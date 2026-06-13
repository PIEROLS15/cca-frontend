import { Suspense } from "react";
import { LoginLeftPanel } from "@/components/login/login-left-panel";
import { LoginForm } from "@/components/login/login-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión | Comunidad Campesina de Asia",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background relative">
      <ThemeToggle />
      <LoginLeftPanel />
      <div className="flex items-center justify-center p-6 lg:p-12">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
