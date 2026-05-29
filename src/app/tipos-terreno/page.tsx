"use client";

import { useState, type FormEvent } from "react";
import { Map, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { NameFormDialog } from "@/components/ui/NameFormDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { useTerrainTypes } from "@/hooks/use-terrain-types";
import type { TerrainType } from "@/types/terrain-type";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type DialogMode = "create" | "edit" | "delete" | null;

export default function TiposTerrenoPage() {
  const {
    terrainTypes,
    loading,
    submitting,
    createTerrainType,
    updateTerrainType,
    deleteTerrainType,
  } = useTerrainTypes();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedTerrainType, setSelectedTerrainType] = useState<TerrainType | null>(null);
  const [name, setName] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredTerrainTypes = terrainTypes.filter((terrainType) =>
    terrainType.name.toLowerCase().includes(normalizedSearch),
  );
  const totalPages = Math.max(1, Math.ceil(filteredTerrainTypes.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const currentTerrainTypes = filteredTerrainTypes.slice(pageStart, pageStart + pageSize);

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
      className: "w-32 text-right",
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
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => openDeleteDialog(terrainType)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {terrainType.name}</span>
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

  function openDeleteDialog(terrainType: TerrainType) {
    setDialogMode("delete");
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

  async function handleDelete() {
    if (!selectedTerrainType) {
      return;
    }

    const success = await deleteTerrainType(selectedTerrainType);

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
          data={currentTerrainTypes}
          rowKey={(terrainType) => terrainType.id}
          loading={loading}
          loadingText="Cargando tipos de terreno..."
          emptyText="Sin resultados"
        />

        {!loading && (
          <PaginationControls
            page={safePage}
            pageSize={pageSize}
            totalItems={filteredTerrainTypes.length}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
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

        <DeleteConfirmDialog
          open={dialogMode === "delete"}
          entityLabel="tipo de terreno"
          itemName={selectedTerrainType?.name}
          submitting={submitting}
          onClose={closeDialog}
          onConfirm={handleDelete}
        />
      </PageContainer>
    </AppLayout>
  );
}
