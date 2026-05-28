"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PageLoader } from "@/components/ui/PageLoader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";

export function ProfileContent() {
  const {
    user,
    loading,
    isAuthenticated,
    fullName, setFullName,
    username, setUsername,
    savingProfile,
    currentPassword, setCurrentPassword,
    verified, setVerified,
    verifying,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    savingPassword,
    handleVerify,
    handleSaveProfile,
    handleChangePassword,
  } = useProfile();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (loading) return <PageLoader />;

  if (!isAuthenticated || !user) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>Actualiza tu nombre completo y nombre de usuario.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" value={user.email} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" value={user.dni} readOnly disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Nombre de usuario</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>Guardar cambios</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cambiar contraseña</CardTitle>
          <CardDescription>Confirma tu contraseña actual para establecer una nueva.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current">Contraseña actual</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="current"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setVerified(false); }}
                    disabled={verified}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant={verified ? "secondary" : "default"}
                  onClick={handleVerify}
                  disabled={verifying || verified}
                >
                  {verified ? "Verificado" : verifying ? "Verificando..." : "Verificar"}
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="new"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!verified}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!verified}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingPassword || !verified}>Actualizar contraseña</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
