"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { NameFormDialog } from "@/components/ui/NameFormDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import { useSectors } from "@/hooks/use-sectors";
import type { Sector } from "@/types/sector";

type DialogMode = "create" | "edit" | "delete" | null;

function SectoresContent() {
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const { sectors, loading, submitting, createSector, updateSector, deleteSector, page, setPage, limit, setLimit, search, setSearch, total, totalPages } = useSectors({
    page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "",
  });

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search });
  }, [page, limit, search, syncToUrl]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [name, setName] = useState("");

  const columns: DataTableColumn<Sector>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (sector) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-medium text-foreground">{sector.name}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      className: "w-32 text-right",
      render: (sector) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-warning hover:text-warning"
            onClick={() => openEditDialog(sector)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar {sector.name}</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => openDeleteDialog(sector)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {sector.name}</span>
          </Button>
        </div>
      ),
    },
  ];

  function closeDialog() {
    setDialogMode(null);
    setSelectedSector(null);
    setName("");
  }

  function openCreateDialog() {
    setDialogMode("create");
    setSelectedSector(null);
    setName("");
  }

  function openEditDialog(sector: Sector) {
    setDialogMode("edit");
    setSelectedSector(sector);
    setName(sector.name);
  }

  function openDeleteDialog(sector: Sector) {
    setDialogMode("delete");
    setSelectedSector(sector);
    setName(sector.name);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("Ingresa el nombre del sector");
      return;
    }

    const success = dialogMode === "edit" && selectedSector
      ? await updateSector(selectedSector.id, normalizedName)
      : await createSector(normalizedName);

    if (success) {
      closeDialog();
    }
  }

  async function handleDelete() {
    if (!selectedSector) {
      return;
    }

    const success = await deleteSector(selectedSector);

    if (success) {
      closeDialog();
    }
  }

  return (
    <AppLayout>
      <PageContainer
        title="Sectores"
        description="Administración de sectores y condominios de la comunidad."
        actions={
          <Button className="gap-1.5" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Agregar sector
          </Button>
        }
      >
        <SearchFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onClear={() => {
            setSearch("");
            setPage(1);
          }}
        />

        <DataTable
          columns={columns}
          data={sectors}
          rowKey={(sector) => sector.id}
          loading={loading}
          loadingText="Cargando sectores..."
          emptyText="Sin resultados"
        />

        {!loading && total > 0 && (
          <PaginationControls
            page={page}
            limit={limit}
            totalItems={total}
            onPageChange={setPage}
            onLimitChange={(value) => {
              setLimit(value);
              setPage(1);
            }}
          />
        )}

        <NameFormDialog
          open={dialogMode === "create" || dialogMode === "edit"}
          mode={dialogMode === "edit" ? "edit" : "create"}
          entityLabel="sector"
          value={name}
          submitting={submitting}
          inputId="sector-name"
          placeholder="Ej. Anexo 5"
          onValueChange={setName}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />

        <DeleteConfirmDialog
          open={dialogMode === "delete"}
          entityLabel="sector"
          itemName={selectedSector?.name}
          previewEndpoint={selectedSector ? `/api/sectors/${selectedSector.id}/delete-preview` : undefined}
          submitting={submitting}
          onClose={closeDialog}
          onConfirm={handleDelete}
        />
      </PageContainer>
    </AppLayout>
  );
}

export default function SectoresPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <SectoresContent />
    </Suspense>
  );
}
