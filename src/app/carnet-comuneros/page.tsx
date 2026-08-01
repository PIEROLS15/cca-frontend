"use client";

import { Suspense, useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Eye, Plus, Printer, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EliminarCarnetDialog } from "@/components/carnet-comuneros/EliminarCarnetDialog";
import { RegistrarComuneroDialog } from "@/components/carnet-comuneros/RegistrarComuneroDialog";
import { RangoSelector } from "@/components/carnet-comuneros/RangoSelector";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCommonerLicenses } from "@/hooks/use-commoner-licenses";
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import type { CarnetComunero } from "@/types/carnet-comunero";

type DialogMode = "create" | "delete" | null;

function CarnetComunerosContent() {
  const router = useRouter();
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const {
    items,
    loading,
    submitting,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    total,
    createCommonerLicense,
    deleteCommonerLicense,
  } = useCommonerLicenses({
    initial: { page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "" },
  });

  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedComunero, setSelectedComunero] = useState<CarnetComunero | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [selectedRange, setSelectedRange] = useState<{
    field: "licenseNumber" | "dni";
    from: string;
    to: string;
  } | null>(null);

  const [dni, setDni] = useState("");
  const [nroCarnet, setNroCarnet] = useState("");
  const [manualValues, setManualValues] = useState("");

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search });
  }, [page, limit, search, syncToUrl]);

  const sortedItems = useMemo(() => [...items].sort((a, b) => b.id - a.id), [items]);
  const totalItems = total;
  const safePage = page;

  const allFilteredSelected =
    sortedItems.length > 0 && sortedItems.every((i) => selected.has(i.id));
  const someFilteredSelected =
    !allFilteredSelected && sortedItems.some((i) => selected.has(i.id));

  function toggleOne(id: number, checked: boolean) {
    setSelectedRange(null);
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAllFiltered(checked: boolean) {
    setSelectedRange(null);
    setSelected((prev) => {
      const next = new Set(prev);
      for (const i of sortedItems) {
        if (checked) next.add(i.id);
        else next.delete(i.id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
    setSelectedRange(null);
  }

  function handleSearchChange(value: string) {
    clearSelection();
    setSearch(value);
    setPage(1);
  }

  function handleClearSearch() {
    clearSelection();
    setSearch("");
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    clearSelection();
    setPage(nextPage);
  }

  function handleLimitChange(nextLimit: number) {
    clearSelection();
    setLimit(nextLimit);
    setPage(1);
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

    void (async () => {
      const ok = await createCommonerLicense({ dni, nroCarnet });
      if (ok) closeDialog();
    })();
  }

  function handleDelete() {
    if (!selectedComunero) return;

    void (async () => {
      const ok = await deleteCommonerLicense(selectedComunero);
      if (ok) {
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(selectedComunero.id);
          return next;
        });
        closeDialog();
      }
    })();
  }

  function handlePrintAll() {
    const params = new URLSearchParams();
    params.set("mode", "all");
    if (search.trim()) params.set("search", search.trim());
    router.push(`/carnet-comuneros/pdf?${params.toString()}`);
  }

  function handlePrintSelected() {
    if (selectedRange) {
      const params = new URLSearchParams();
      params.set("mode", "range");
      params.set("field", selectedRange.field);
      params.set("from", selectedRange.from);
      params.set("to", selectedRange.to);
      if (search.trim()) params.set("search", search.trim());
      router.push(`/carnet-comuneros/pdf?${params.toString()}`);
      return;
    }

    if (selected.size === 1) {
      const id = [...selected][0];
      router.push(`/carnet-comuneros/${id}/pdf`);
      return;
    }

    toast.info("Usa el selector de rango o selecciona un solo carnet.");
  }

  function handlePrintList() {
    const values = manualValues.trim();

    if (!values) {
      toast.error("Ingresa al menos un DNI o N° de carnet.");
      return;
    }

    const params = new URLSearchParams();
    params.set("mode", "list");
    params.set("values", values);
    if (search.trim()) params.set("search", search.trim());
    router.push(`/carnet-comuneros/pdf?${params.toString()}`);
  }

  function handleViewPdf(id: number) {
    router.push(`/carnet-comuneros/${id}/pdf`);
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
            className="h-8 w-8 text-info hover:text-info"
            aria-label="Ver detalles"
            onClick={() => handleViewPdf(r.id)}
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
              <Printer className="h-4 w-4" /> Imprimir todos
            </Button>
            <Button onClick={openCreateDialog} className="gap-1.5">
              <Plus className="h-4 w-4" /> Nuevo comunero
            </Button>
          </div>
        }
      >
        <SearchFilters
          search={search}
          onSearchChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder="Buscar por DNI o N° de carnet..."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <RangoSelector
            items={items}
            onApply={(selection) => {
              setSelected(new Set(selection.ids));
              setSelectedRange({ field: selection.field, from: selection.from, to: selection.to });
              toast.success(`${selection.ids.length} carnets añadidos a la selección.`);
            }}
          />

          <Card className="p-4">
            <div className="flex h-full flex-col justify-end gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium">Imprimir por lista</label>
                <Input
                  value={manualValues}
                  onChange={(e) => setManualValues(e.target.value)}
                  placeholder="4776,4777,0001"
                />
              </div>

              <Button type="button" variant="outline" onClick={handlePrintList}>
                <Printer className="h-4 w-4" /> Imprimir lista
              </Button>
            </div>
          </Card>
        </div>

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
          data={sortedItems}
          rowKey={(r) => r.id}
          loading={loading}
          loadingText="Cargando carnets..."
          emptyText="Aún no hay comuneros registrados."
        />

        {!loading && totalItems > 0 && (
          <PaginationControls
            page={safePage}
            limit={limit}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}

        <RegistrarComuneroDialog
          open={dialogMode === "create"}
          dni={dni}
          nroCarnet={nroCarnet}
          submitting={submitting}
          onDniChange={setDni}
          onNroCarnetChange={setNroCarnet}
          onClose={closeDialog}
          onSubmit={handleSubmitCreate}
        />

        <EliminarCarnetDialog
          open={dialogMode === "delete"}
          item={selectedComunero}
          submitting={submitting}
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
