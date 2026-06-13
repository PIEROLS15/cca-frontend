"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  FileSignature,
  FileText,
  Home,
  Map,
  ScrollText,
  UserCircle,
  UserSquare2,
  Users,
} from "lucide-react";

import { useSession } from "@/context/session-context";
import { canAccessModule, canAccessPath } from "@/lib/access-control";
import { useTheme } from "@/store/theme";

const nav = [
  { to: "/", label: "Inicio", icon: Home, moduleKey: "dashboard" },
  { to: "/certificados", label: "Certificados", icon: FileText, moduleKey: "certificates" },
  { to: "/sectores", label: "Sectores", icon: Building2, moduleKey: "sectors" },
  { to: "/tipos-terreno", label: "Tipos de Terreno", icon: Map, moduleKey: "terrain-types" },
  { to: "/clientes", label: "Clientes", icon: Users, moduleKey: "clients" },
  { to: "/comuneros", label: "Comuneros", icon: UserSquare2, moduleKey: "comuneros" },
  { to: "/solicitudes-certificados", label: "Solicitudes Cert.", icon: FileSignature, moduleKey: "certificate-requests" },
  { to: "/solicitudes-acta", label: "Solicitudes Acta", icon: ScrollText, moduleKey: "assembly-record-requests" },
  { to: "/usuarios", label: "Usuarios", icon: UserCircle, moduleKey: "users" },
] as const;

export function useAppLayout() {
  const { user, isAuthenticated, loading, logout } = useSession();
  const { theme, toggle, apply } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);

  useEffect(() => {
    apply();
  }, [apply]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && user && !canAccessPath(user, pathname)) {
      router.replace("/");
    }
  }, [loading, user, pathname, router]);

  const visibleNav = useMemo(
    () => (user ? nav.filter((item) => canAccessModule(user, item.moduleKey)) : []),
    [user],
  );

  const mobileOpen = mobileMenuPath === pathname;

  const currentLabel = useMemo(() => {
    const exact = visibleNav.find((item) => item.to === pathname);
    if (exact) return exact.label;

    const nested = visibleNav.find((item) => pathname.startsWith(item.to) && item.to !== "/");
    return nested?.label ?? "Inicio";
  }, [pathname, visibleNav]);

  const initials = useMemo(() => {
    if (!user?.fullName) return "";
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("");
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const goToProfile = () => {
    router.push("/perfil");
  };

  return {
    user,
    loading,
    pathname,
    theme,
    toggleTheme: toggle,
    mobileOpen,
    setMobileOpen: (open: boolean) => setMobileMenuPath(open ? pathname : null),
    currentLabel,
    visibleNav,
    initials,
    goToProfile,
    handleLogout,
  };
}
