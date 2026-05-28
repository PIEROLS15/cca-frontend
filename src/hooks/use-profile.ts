"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthService } from "@/services/auth.service";
import { useSession } from "@/context/session-context";

export function useProfile() {
  const { user, isAuthenticated, loading, updateUserData } = useSession();
  const router = useRouter();

  const [dirtyFullName, setDirtyFullName] = useState<string | null>(null);
  const [dirtyUsername, setDirtyUsername] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const fullName = dirtyFullName ?? user?.fullName ?? "";
  const username = dirtyUsername ?? user?.username ?? "";

  const setFullName = (value: string) => setDirtyFullName(value);
  const setUsername = (value: string) => setDirtyUsername(value);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/login");
  }, [loading, isAuthenticated, router]);

  const handleVerify = useCallback(async () => {
    if (!currentPassword) {
      toast.error("Ingresa tu contraseña actual");
      return;
    }
    setVerifying(true);
    try {
      await AuthService.verifyPassword(currentPassword);
      setVerified(true);
      toast.success("Contraseña verificada");
    } catch {
      toast.error("La contraseña actual no es correcta");
      setVerified(false);
    }
    setVerifying(false);
  }, [currentPassword]);

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      toast.error("Completa nombre completo y nombre de usuario");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await AuthService.updateProfile({
        fullName: fullName.trim(),
        username: username.trim(),
        email: user!.email,
      });
      updateUserData(res.user);
      setDirtyFullName(null);
      setDirtyUsername(null);
      toast.success("Perfil actualizado");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el perfil";
      toast.error(message);
    }
    setSavingProfile(false);
  }, [fullName, username, user, updateUserData]);

  const handleChangePassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      toast.error("Primero verifica tu contraseña actual");
      return;
    }
    if (!newPassword || !confirmPassword) {
      toast.error("Completa todos los campos");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setSavingPassword(true);
    try {
      await AuthService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setVerified(false);
      toast.success("Contraseña actualizada");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo cambiar la contraseña";
      toast.error(message);
    }
    setSavingPassword(false);
  }, [verified, newPassword, confirmPassword, currentPassword]);

  return {
    user,
    loading,
    isAuthenticated,
    fullName,
    setFullName,
    username,
    setUsername,
    savingProfile,
    currentPassword,
    setCurrentPassword,
    verified,
    setVerified,
    verifying,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    savingPassword,
    handleVerify,
    handleSaveProfile,
    handleChangePassword,
  };
}
