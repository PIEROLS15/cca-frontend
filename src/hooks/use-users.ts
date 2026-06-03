"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { UsersService } from "@/services/users.service";
import { RolesService } from "@/services/roles.service";
import type { User, Role } from "@/types/user";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        const [usersData, rolesData] = await Promise.all([
          UsersService.listAll(),
          RolesService.listAll(),
        ]);

        if (!cancelled) {
          setUsers(usersData);
          setRoles(rolesData);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "No se pudieron cargar los datos"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAll();

    return () => {
      cancelled = true;
    };
  }, []);

  const reloadUsers = useCallback(async () => {
    const data = await UsersService.listAll();
    setUsers(data);
  }, []);

  async function deleteUser(user: User) {
    setSubmitting(true);

    try {
      await UsersService.remove(user.id);
      await reloadUsers();
      toast.success(`Usuario ${user.fullName} eliminado`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar el usuario"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleUserStatus(user: User) {
    setSubmitting(true);

    try {
      await UsersService.toggleStatus(user.id, !user.isActive);
      await reloadUsers();
      toast.success(`Usuario ${user.isActive ? "desactivado" : "activado"}`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo cambiar el estado del usuario"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function createUser(payload: Parameters<typeof UsersService.create>[0]) {
    setSubmitting(true);

    try {
      await UsersService.create(payload);
      await reloadUsers();
      toast.success("Usuario creado correctamente");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo crear el usuario"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateUser(id: number, payload: Parameters<typeof UsersService.update>[1]) {
    setSubmitting(true);

    try {
      await UsersService.update(id, payload);
      await reloadUsers();
      toast.success("Usuario actualizado correctamente");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo actualizar el usuario"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    users,
    roles,
    loading,
    submitting,
    toggleUserStatus,
    deleteUser,
    createUser,
    updateUser,
    reloadUsers,
  };
}
