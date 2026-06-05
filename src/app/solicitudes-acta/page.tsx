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
import { formatDateTime } from "@/lib/utils";
import type { AssemblyRecordRequest } from "@/types/assembly-record-request";

function SolicitudesActaContent() {
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const { requests, loading, submitting, deleteRequest, page, setPage, limit, setLimit, search, setSearch, total, totalPages } = useAssemblyRecordRequests({
    page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "",
  });
  const [selectedRequest, setSelectedRequest] = useState<AssemblyRecordRequest | null>(null);

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search });
  }, [page, limit, search, syncToUrl]);

  const columns: DataTableColumn<AssemblyRecordRequest>[] = [
    {
      key: "code",
      header: "Código",
      render: (r) => <span className="font-mono text-xs">{r.code}</span>,
    },
    {
      key: "certificate",
      header: "Certificado",
      render: (r) => <span className="font-mono text-xs">{r.certificate.certificateNumber}</span>,
    },
    {
      key: "client",
      header: "Cliente",
      render: (r) => <span className="font-medium text-xs">{r.client.fullName}</span>,
    },
    {
      key: "description",
      header: "Descripción",
      render: (r) => <span className="text-xs text-muted-foreground truncate max-w-48 block">{r.description || "—"}</span>,
    },
    {
      key: "createdAt",
      header: "Fecha",
      render: (r) => (
        <div className="text-xs text-muted-foreground leading-tight">
          <div>{formatDateTime(r.createdAt)}</div>
        </div>
      ),
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
          placeholder="Buscar por código, certificado, cliente o descripción..."
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
