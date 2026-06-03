"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { useAssemblyRecordRequests } from "@/hooks/use-assembly-record-requests";
import { AssemblyRecordRequestsService } from "@/services/assembly-record-requests.service";
import { formatDateTime } from "@/lib/utils";
import type { AssemblyRecordRequest } from "@/types/assembly-record-request";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function SolicitudesActaPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState<AssemblyRecordRequest | null>(null);
  const { requests, loading, submitting, deleteRequest } = useAssemblyRecordRequests();

  const filteredRequests = requests.filter((r) => {
    const s = search.toLowerCase();
    if (!s) return true;
    return (
      r.code.toLowerCase().includes(s) ||
      r.certificate.certificateNumber.toLowerCase().includes(s) ||
      r.client.fullName.toLowerCase().includes(s) ||
      (r.description ?? "").toLowerCase().includes(s)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const currentRequests = filteredRequests.slice((safePage - 1) * pageSize, safePage * pageSize);

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
          data={currentRequests}
          rowKey={(r) => r.id}
          loading={loading}
          loadingText="Cargando solicitudes..."
          emptyText="Sin resultados"
        />

        {!loading && (
          <PaginationControls
            page={safePage}
            pageSize={pageSize}
            totalItems={filteredRequests.length}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
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
