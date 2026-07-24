"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import { Check, Eye, Plus, Printer, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { EliminarCarnetDialog } from "@/components/carnet-comuneros/EliminarCarnetDialog";
import { RegistrarComuneroDialog } from "@/components/carnet-comuneros/RegistrarComuneroDialog";
import { RangoSelector } from "@/components/carnet-comuneros/RangoSelector";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCarnetComuneros } from "@/store/carnet-comuneros";
import type { CarnetComunero } from "@/types/carnet-comunero";

type DialogMode = "create" | "delete" | null;

function CarnetComunerosContent() {
  const items = useCarnetComuneros((s) => s.items);
  const add = useCarnetComuneros((s) => s.add);
  const remove = useCarnetComuneros((s) => s.remove);

  const [search, setSearch] = useState("");
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedComunero, setSelectedComunero] = useState<CarnetComunero | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const [dni, setDni] = useState("");
  const [nroCarnet, setNroCarnet] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filteredData = useMemo(() => {
    const s = search.trim().toLowerCase();
    const sorted = [...items].sort((a, b) => b.id - a.id);
    if (!s) return sorted;
    return sorted.filter(
      (i) => i.dni.includes(s) || i.nroCarnet.toLowerCase().includes(s),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const safePage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * limit, safePage * limit);

  const allFilteredSelected =
    paginatedData.length > 0 && paginatedData.every((i) => selected.has(i.id));
  const someFilteredSelected =
    !allFilteredSelected && paginatedData.some((i) => selected.has(i.id));

  function toggleOne(id: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAllFiltered(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const i of paginatedData) {
        if (checked) next.add(i.id);
        else next.delete(i.id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedComunero(null);
    setDni("");
    setNroCarnet("");
  }

  function openCreateDialog() {
    setDialogMode("create");
    setSelectedComunero(null);
    setDni("");
    setNroCarnet("");
  }

  function openDeleteDialog(item: CarnetComunero) {
    setDialogMode("delete");
    setSelectedComunero(item);
  }

  function handleSubmitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const res = add(dni, nroCarnet);
    if (!res.ok) {
      toast.error(res.error ?? "No se pudo registrar");
      return;
    }

    toast.success("Comunero registrado correctamente.");
    closeDialog();
  }

  function handleDelete() {
    if (!selectedComunero) return;

    remove(selectedComunero.id);
    toast.success("Registro eliminado.");
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(selectedComunero.id);
      return next;
    });
    closeDialog();
  }

  function handlePrintAll() {
    toast.info("Función de impresión próximamente.");
  }

  function handlePrintSelected() {
    toast.info("Función de impresión próximamente.");
  }

  const columns: DataTableColumn<CarnetComunero>[] = [
    {
      key: "select",
      header: (
        <Checkbox
          checked={
            allFilteredSelected
              ? true
              : someFilteredSelected
                ? "indeterminate"
                : false
          }
          onCheckedChange={(v) => toggleAllFiltered(v === true)}
          aria-label="Seleccionar todos"
        />
      ),
      className: "w-10",
      render: (r) => (
        <Checkbox
          checked={selected.has(r.id)}
          onCheckedChange={(v) => toggleOne(r.id, v === true)}
          aria-label={`Seleccionar ${r.dni}`}
        />
      ),
    },
    {
      key: "dni",
      header: "DNI",
      render: (r) => <span className="font-mono font-medium">{r.dni}</span>,
    },
    {
      key: "nroCarnet",
      header: "N° CARNET",
      render: (r) => <span className="font-mono">{r.nroCarnet}</span>,
    },
    {
      key: "nombre",
      header: "NOMBRE",
      render: (r) =>
        r.nombre ? (
          <span className="font-medium">{r.nombre}</span>
        ) : (
          <span className="text-xs italic text-muted-foreground">—</span>
        ),
    },
    {
      key: "foto",
      header: "FOTO",
      render: (r) =>
        r.foto ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <Check className="h-3 w-3" /> Sí
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            <X className="h-3 w-3" /> No
          </span>
        ),
    },
    {
      key: "registrado",
      header: "REGISTRADO",
      render: (r) => (
        <span className="text-xs text-muted-foreground">
          {new Date(r.registrado).toLocaleString("es-PE")}
        </span>
      ),
    },
    {
      key: "acciones",
      header: "",
      className: "w-24 text-right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            aria-label="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => openDeleteDialog(r)}
            aria-label="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <PageContainer
        title="Carnet Comuneros"
        description="Registra manualmente el DNI y N° de carnet de cada comunero."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {selected.size > 0 && (
              <Button
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handlePrintSelected}
              >
                <Printer className="h-4 w-4" /> Imprimir seleccionados ({selected.size})
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={items.length === 0}
              onClick={handlePrintAll}
            >
              <Printer className="h-4 w-4" /> Imprimir todos (A4)
            </Button>
            <Button onClick={openCreateDialog} className="gap-1.5">
              <Plus className="h-4 w-4" /> Nuevo comunero
            </Button>
          </div>
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
          placeholder="Buscar por DNI o N° de carnet..."
        />

        <RangoSelector
          items={items}
          onApply={(ids) => {
            setSelected(new Set(ids));
            toast.success(`${ids.length} carnets añadidos a la selección.`);
          }}
        />

        {selected.size > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm">
            <span className="text-foreground">
              <span className="font-semibold">{selected.size}</span>{" "}
              {selected.size === 1 ? "carnet seleccionado" : "carnets seleccionados"}
            </span>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="h-7">
              Limpiar selección
            </Button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={paginatedData}
          rowKey={(r) => r.id}
          emptyText="Aún no hay comuneros registrados."
          footer={
            filteredData.length > 0 ? (
              <PaginationControls
                page={safePage}
                limit={limit}
                totalItems={filteredData.length}
                onPageChange={setPage}
                onLimitChange={(value) => {
                  setLimit(value);
                  setPage(1);
                }}
              />
            ) : null
          }
        />

        <RegistrarComuneroDialog
          open={dialogMode === "create"}
          dni={dni}
          nroCarnet={nroCarnet}
          submitting={false}
          onDniChange={setDni}
          onNroCarnetChange={setNroCarnet}
          onClose={closeDialog}
          onSubmit={handleSubmitCreate}
        />

        <EliminarCarnetDialog
          open={dialogMode === "delete"}
          item={selectedComunero}
          submitting={false}
          onClose={closeDialog}
          onConfirm={handleDelete}
        />
      </PageContainer>
    </AppLayout>
  );
}

export default function CarnetComunerosPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-muted-foreground">Cargando...</div>
      }
    >
      <CarnetComunerosContent />
    </Suspense>
  );
}
