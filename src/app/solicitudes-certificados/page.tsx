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
import { useCertificateRequests } from "@/hooks/use-certificate-requests";
import { CertificateRequestsService } from "@/services/certificate-requests.service";
import { formatDateTime } from "@/lib/utils";
import type { CertificateRequest } from "@/types/certificate-request";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const CERTIFICATE_TYPE_LABELS: Record<string, string> = {
  certificadoposesion: "Certificado de Posesión",
  planomemoria: "Plano y Memoria",
  otros: "Otros",
};

function formatCertificateTypes(types: CertificateRequest["certificateTypes"]) {
  return types
    .map((item) => {
      const label = CERTIFICATE_TYPE_LABELS[item.type.toLowerCase()];
      return label === "Otros" && item.otherType ? item.otherType : (label || item.type);
    })
    .join(", ");
}

export default function CertificateRequestsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const { requests, loading, submitting, deleteRequest } = useCertificateRequests();

  const normalizedSearch = search.trim().toLowerCase();
  const filteredRequests = requests.filter((request) =>
    request.requestNumber.toLowerCase().includes(normalizedSearch)
    || request.client.documentNumber.toLowerCase().includes(normalizedSearch)
    || request.client.fullName.toLowerCase().includes(normalizedSearch),
  );
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const currentRequests = filteredRequests.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns: DataTableColumn<CertificateRequest>[] = [
    {
      key: "requestNumber",
      header: "Código",
      render: (request) => <span className="font-mono text-xs">{request.requestNumber}</span>,
    },
    {
      key: "requestDescription",
      header: "Descripción",
      render: (request) => <span className="font-medium">{request.requestDescription || "-"}</span>,
    },
    {
      key: "client",
      header: "Cliente",
      render: (request) => <span className="text-xs">{request.client.fullName}</span>,
    },
    {
      key: "document",
      header: "Documento",
      render: (request) => <span className="font-mono text-xs">{request.client.documentNumber}</span>,
    },
    {
      key: "type",
      header: "Tipo",
      render: (request) => <span className="text-xs">{formatCertificateTypes(request.certificateTypes) || "-"}</span>,
    },
    {
      key: "destination",
      header: "Destino",
      render: (request) => <span className="text-xs text-muted-foreground">{request.destination || "-"}</span>,
    },
    {
      key: "createdAt",
      header: "Fecha Creación",
      render: (request) => <span className="font-mono text-xs text-muted-foreground">{formatDateTime(request.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Acciones",
      className: "text-right w-36",
      render: (request) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-info hover:text-info"
            onClick={() => window.open(CertificateRequestsService.getPdfUrl(request.id, request.requestNumber), "_blank", "noopener,noreferrer")}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver PDF {request.requestNumber}</span>
          </Button>
          <Button asChild type="button" size="icon" variant="ghost" className="h-8 w-8 text-warning hover:text-warning">
            <Link href={`/solicitudes-certificados/${request.id}/editar`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar {request.requestNumber}</span>
            </Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setSelectedRequest(request)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {request.requestNumber}</span>
          </Button>
        </div>
      ),
    },
  ];

  async function handleDelete() {
    if (!selectedRequest) {
      return;
    }

    const success = await deleteRequest(selectedRequest);

    if (success) {
      setSelectedRequest(null);
    }
  }

  return (
    <AppLayout>
      <PageContainer
        title="Solicitudes de Certificados"
        description="Gestión de solicitudes pendientes y procesadas."
        actions={
          <Button asChild className="gap-1.5">
            <Link href="/solicitudes-certificados/nuevo">
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
          placeholder="Buscar por código o documento del cliente..."
        >
        </SearchFilters>

        <DataTable
          columns={columns}
          data={currentRequests}
          rowKey={(request) => request.id}
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
          entityLabel="solicitud de certificado"
          itemName={selectedRequest?.requestNumber}
          submitting={submitting}
          onClose={() => setSelectedRequest(null)}
          onConfirm={handleDelete}
        />
      </PageContainer>
    </AppLayout>
  );
}
