"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { UsersService } from "@/services/users.service";
import { RolesService } from "@/services/roles.service";
import type { User, Role } from "@/types/user";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useUsers(initial?: { page?: number; limit?: number; search?: string; roleId?: number; isActive?: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 5);
  const [search, setSearch] = useState(initial?.search ?? "");
  const [roleId, setRoleId] = useState<number | undefined>(initial?.roleId);
  const [isActive, setIsActive] = useState<boolean | undefined>(initial?.isActive);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResult, rolesData] = await Promise.all([
        UsersService.list({ page, limit, search, roleId, isActive }),
        RolesService.listAll(),
      ]);
      setUsers(usersResult.data);
      setTotal(usersResult.total);
      setTotalPages(usersResult.totalPages);
      setRoles(rolesData);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudieron cargar los datos"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, roleId, isActive]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const [usersResult, rolesData] = await Promise.all([
          UsersService.list({ page, limit, search, roleId, isActive }),
          RolesService.listAll(),
        ]);
        if (!cancelled) {
          setUsers(usersResult.data);
          setTotal(usersResult.total);
          setTotalPages(usersResult.totalPages);
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
    })();
    return () => { cancelled = true; };
  }, [page, limit, search, roleId, isActive]);

  async function deleteUser(user: User) {
    setSubmitting(true);

    try {
      await UsersService.remove(user.id);
      await loadUsers();
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
      await loadUsers();
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
      await loadUsers();
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
      await loadUsers();
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
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    roleId,
    setRoleId,
    isActive,
    setIsActive,
    total,
    totalPages,
    toggleUserStatus,
    deleteUser,
    createUser,
    updateUser,
  };
}
