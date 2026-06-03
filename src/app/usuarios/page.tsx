"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Power, PowerOff } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/use-users";
import { UserFormDialog } from "@/components/usuarios/UserFormDialog";
import { StatusToggleDialog } from "@/components/usuarios/StatusToggleDialog";
import { UserRoleBadge } from "@/components/usuarios/UserRoleBadge";
import { UserActiveBadge } from "@/components/usuarios/UserActiveBadge";
import type { User } from "@/types/user";

export default function UsuariosPage() {
  const { users, roles, loading, submitting, toggleUserStatus, createUser, updateUser } = useUsers();
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [formDlg, setFormDlg] = useState<{ mode: "create" | "edit"; user: User | null } | null>(null);
  const [toggleDlg, setToggleDlg] = useState<User | null>(null);

  const roleOptions = useMemo(
    () => roles.map((r) => ({ label: r.name, value: r.name })),
    [roles],
  );

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search && !`${u.fullName} ${u.username} ${u.email ?? ""}`.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      if (rolFilter && u.role.name !== rolFilter) {
        return false;
      }

      if (estadoFilter && (estadoFilter === "activo") !== u.isActive) {
        return false;
      }

      return true;
    });
  }, [users, search, rolFilter, estadoFilter]);

  const columns: DataTableColumn<User>[] = [
    {
      key: "fullName",
      header: "Nombre",
      render: (u) => <span className="font-medium">{u.fullName}</span>,
    },
    {
      key: "username",
      header: "Usuario",
      render: (u) => <span className="font-mono text-xs">{u.username}</span>,
    },
    {
      key: "email",
      header: "Correo",
      render: (u) => <span className="text-xs">{u.email ?? "—"}</span>,
    },
    {
      key: "role",
      header: "Rol",
      render: (u) => <UserRoleBadge name={u.role.name} />,
    },
    {
      key: "isActive",
      header: "Estado",
      render: (u) => <UserActiveBadge isActive={u.isActive} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-28",
      render: (u) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            size="icon"
            variant="ghost"
            className={`h-8 w-8 ${
              u.isActive ? "text-destructive hover:text-destructive" : "text-success hover:text-success"
            }`}
            onClick={() => setToggleDlg(u)}
            title={u.isActive ? "Desactivar" : "Activar"}
          >
            {u.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-warning hover:text-warning"
            onClick={() => setFormDlg({ mode: "edit", user: u })}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  async function handleFormSubmit(data: Record<string, string>, mode: "create" | "edit") {
    if (mode === "create") {
      const ok = await createUser({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        dni: data.dni,
        roleId: Number(data.roleId),
      });

      if (ok) {
        setFormDlg(null);
      }
    } else if (formDlg?.user) {
      const payload: Record<string, unknown> = {};

      if (data.fullName !== formDlg.user.fullName) payload.fullName = data.fullName;
      if (data.username !== formDlg.user.username) payload.username = data.username;
      if (data.email !== formDlg.user.email) payload.email = data.email;
      if (data.dni !== formDlg.user.dni) payload.dni = data.dni;
      if (Number(data.roleId) !== formDlg.user.role.id) payload.roleId = Number(data.roleId);
      if (data.password) payload.password = data.password;

      if (Object.keys(payload).length === 0) {
        setFormDlg(null);
        return;
      }

      const ok = await updateUser(formDlg.user.id, payload);

      if (ok) {
        setFormDlg(null);
      }
    }
  }

  async function handleToggle(user: User) {
    const ok = await toggleUserStatus(user);

    if (ok) {
      setToggleDlg(null);
    }
  }

  return (
    <AppLayout>
      <PageContainer
        title="Usuarios"
        description="Gestión de cuentas y accesos al sistema."
        actions={
          <Button className="gap-1.5" onClick={() => setFormDlg({ mode: "create", user: null })}>
            <Plus className="h-4 w-4" /> Agregar usuario
          </Button>
        }
      >
        <SearchFilters
          search={search}
          onSearchChange={(value) => setSearch(value)}
          onClear={() => { setSearch(""); setRolFilter(""); setEstadoFilter(""); }}
          placeholder="Buscar por nombre, usuario o correo..."
        >
          <Select
            value={rolFilter || "all"}
            onValueChange={(v) => setRolFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="lg:w-44">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              {roleOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={estadoFilter || "all"}
            onValueChange={(v) => setEstadoFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="activo">Activos</SelectItem>
              <SelectItem value="inactivo">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </SearchFilters>

        <DataTable
          columns={columns}
          data={filtered}
          rowKey={(u) => u.id}
          loading={loading}
          loadingText="Cargando usuarios..."
          emptyText="Sin resultados"
        />

        <UserFormDialog
          open={formDlg !== null}
          mode={formDlg?.mode ?? "create"}
          user={formDlg?.user ?? null}
          roles={roles}
          submitting={submitting}
          onClose={() => setFormDlg(null)}
          onSubmit={handleFormSubmit}
        />

        <StatusToggleDialog
          open={toggleDlg !== null}
          user={toggleDlg}
          submitting={submitting}
          onClose={() => setToggleDlg(null)}
          onConfirm={handleToggle}
        />
      </PageContainer>
    </AppLayout>
  );
}
