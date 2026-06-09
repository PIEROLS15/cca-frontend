"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { Map, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { NameFormDialog } from "@/components/ui/NameFormDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import { useTerrainTypes } from "@/hooks/use-terrain-types";
import type { TerrainType } from "@/types/terrain-type";

type DialogMode = "create" | "edit" | null;

function TiposTerrenoContent() {
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const {
    terrainTypes,
    loading,
    submitting,
    createTerrainType,
    updateTerrainType,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    total,
  } = useTerrainTypes({
    page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "",
  });

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search });
  }, [page, limit, search, syncToUrl]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedTerrainType, setSelectedTerrainType] = useState<TerrainType | null>(null);
  const [name, setName] = useState("");

  const columns: DataTableColumn<TerrainType>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (terrainType) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Map className="h-4 w-4" />
          </div>
          <span className="font-medium text-foreground">{terrainType.name}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      className: "w-16 text-right",
      render: (terrainType) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-warning hover:text-warning"
            onClick={() => openEditDialog(terrainType)}
            >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar {terrainType.name}</span>
          </Button>
        </div>
      ),
    },
  ];

  function closeDialog() {
    setDialogMode(null);
    setSelectedTerrainType(null);
    setName("");
  }

  function openCreateDialog() {
    setDialogMode("create");
    setSelectedTerrainType(null);
    setName("");
  }

  function openEditDialog(terrainType: TerrainType) {
    setDialogMode("edit");
    setSelectedTerrainType(terrainType);
    setName(terrainType.name);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();

    if (!normalizedName) {
      toast.error("Ingresa el nombre del tipo de terreno");
      return;
    }

    const success = dialogMode === "edit" && selectedTerrainType
      ? await updateTerrainType(selectedTerrainType.id, normalizedName)
      : await createTerrainType(normalizedName);

    if (success) {
      closeDialog();
    }
  }

  return (
    <AppLayout>
      <PageContainer
        title="Tipos de Terreno"
        description="Catálogo de clasificaciones de terreno disponibles."
        actions={
          <Button className="gap-1.5" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Agregar tipo
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
          data={terrainTypes}
          rowKey={(terrainType) => terrainType.id}
          loading={loading}
          loadingText="Cargando tipos de terreno..."
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
          entityLabel="tipo de terreno"
          value={name}
          submitting={submitting}
          inputId="terrain-type-name"
          placeholder="Ej. Agrícola"
          onValueChange={setName}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />

      </PageContainer>
    </AppLayout>
  );
}

export default function TiposTerrenoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <TiposTerrenoContent />
    </Suspense>
  );
}
