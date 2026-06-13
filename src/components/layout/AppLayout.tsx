"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, Moon, Sun, X, ChevronRight, UserCircle } from "lucide-react";

import { useAppLayout } from "@/hooks/use-app-layout";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppLayout({ children }: { children: ReactNode }) {
  const {
    user,
    loading,
    pathname,
    theme,
    toggleTheme,
    mobileOpen,
    setMobileOpen,
    currentLabel,
    visibleNav,
    initials,
    goToProfile,
    handleLogout,
  } = useAppLayout();

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground z-50 flex flex-col border-r border-sidebar-border">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 px-4 lg:px-8 h-18.75">
            <button
              className="lg:hidden p-2 -ml-2 rounded-md hover:bg-accent"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Panel</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{currentLabel}</span>
            </nav>

            <div className="flex-1" />

            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-full hover:bg-accent transition-colors">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium leading-tight">{user.fullName.split(" ")[0]}</div>
                    <div className="text-xs text-muted-foreground leading-tight">{user.role.name}</div>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-semibold">{user.fullName}</div>
                  <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={goToProfile}>
                  <UserCircle className="h-4 w-4 mr-2" /> Mi perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );

  function SidebarContent({ onClose }: { onClose?: () => void } = {}) {
    return (
      <>
        <div className="flex items-center justify-between px-5 border-b border-sidebar-border h-18.75">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/images/logo.png"
              alt="Comunidad Campesina de Asia"
              width={781}
              height={319}
              className="h-11 w-auto shrink-0 drop-shadow"
              sizes="108px"
              loading="eager"
            />
          </Link>
          {onClose && (
            <button onClick={onClose} className="p-1 rounded-md hover:bg-sidebar-accent">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </>
    );
  }
}
