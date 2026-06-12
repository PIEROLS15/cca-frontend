"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import { useAssemblyRecordRequests } from "@/hooks/use-assembly-record-requests";
import { AssemblyRecordRequestsService } from "@/services/assembly-record-requests.service";
import type { AssemblyRecordRequest } from "@/types/assembly-record-request";

function formatDateOnly(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("es-PE", { timeZone: "UTC" });
}

function isComunero(value: string) {
  return String(value || "").trim().toLowerCase() === "comunero";
}

function SolicitudesActaContent() {
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const { requests, loading, submitting, deleteRequest, page, setPage, limit, setLimit, search, setSearch, total } = useAssemblyRecordRequests({
    page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "",
  });
  const [selectedRequest, setSelectedRequest] = useState<AssemblyRecordRequest | null>(null);

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search });
  }, [page, limit, search, syncToUrl]);

  const columns: DataTableColumn<AssemblyRecordRequest>[] = [
    {
      key: "certificateNumber",
      header: "Código Certificado",
      render: (r) => <span className="font-mono text-xs">{r.certificate.certificateNumber}</span>,
    },
    {
      key: "description",
      header: "Descripción",
      render: (r) => <span className="text-xs text-muted-foreground truncate max-w-48 block">{r.description || "—"}</span>,
    },
    {
      key: "typeUser",
      header: "Comunero",
      render: (r) => <span className="text-xs">{isComunero(r.typeUser) ? "Sí" : "No"}</span>,
    },
    {
      key: "buyerFullName",
      header: "Comprador",
      render: (r) => <span className="font-medium text-xs">{r.buyerFullName || r.client.fullName || "—"}</span>,
    },
    {
      key: "sectorLocation",
      header: "Ubicacion",
      render: (r) => <span className="text-xs text-muted-foreground">{r.sectorLocation || "—"}</span>,
    },
    {
      key: "terrainType",
      header: "Tipo de Terreno",
      render: (r) => <span className="text-xs text-muted-foreground">{r.terrainType || "—"}</span>,
    },
    {
      key: "awardDate",
      header: "Fecha de Adjudicación",
      render: (r) => <span className="text-xs text-muted-foreground">{formatDateOnly(r.awardDate)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-28",
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-info hover:text-info"
            title="Ver PDF"
            onClick={() => window.open(AssemblyRecordRequestsService.getPdfUrl(r.code), "_blank", "noopener,noreferrer")}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver PDF {r.code}</span>
          </Button>
          <Button asChild type="button" size="icon" variant="ghost" className="h-8 w-8 text-warning hover:text-warning">
            <Link href={`/solicitudes-acta/${r.id}/editar`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar {r.code}</span>
            </Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setSelectedRequest(r)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {r.code}</span>
          </Button>
        </div>
      ),
    },
  ];

  async function handleDelete() {
    if (!selectedRequest) return;

    const success = await deleteRequest(selectedRequest);

    if (success) {
      setSelectedRequest(null);
    }
  }

  return (
    <AppLayout>
      <PageContainer
        title="Solicitudes de Acta de Asamblea"
        description="Adjudicaciones y actas registradas en asamblea comunal."
        actions={
          <Button asChild className="gap-1.5">
            <Link href="/solicitudes-acta/nuevo">
              <Plus className="h-4 w-4" /> Agregar solicitud
            </Link>
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
          placeholder="Buscar por código, certificado, comprador, ubicación o descripción..."
        />

        <DataTable
          columns={columns}
          data={requests}
          rowKey={(r) => r.id}
          loading={loading}
          loadingText="Cargando solicitudes..."
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

        <DeleteConfirmDialog
          open={Boolean(selectedRequest)}
          entityLabel="solicitud de acta"
          itemName={selectedRequest?.code}
          previewEndpoint={selectedRequest ? `/api/assembly-record-requests/${selectedRequest.id}/delete-preview` : undefined}
          submitting={submitting}
          onClose={() => setSelectedRequest(null)}
          onConfirm={handleDelete}
        />
      </PageContainer>
    </AppLayout>
  );
}

export default function SolicitudesActaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <SolicitudesActaContent />
    </Suspense>
  );
}
