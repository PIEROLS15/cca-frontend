"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { CertificateRequestStatusBadge } from "@/components/solicitudes-certificados/CertificateRequestStatusBadge";
import { CertificateRequestStatusDialog } from "@/components/solicitudes-certificados/CertificateRequestStatusDialog";
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import { useCertificateRequests } from "@/hooks/use-certificate-requests";
import { formatDateTime } from "@/lib/utils";
import type { CertificateRequest, CertificateRequestStatus } from "@/types/certificate-request";

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

function CertificateRequestsContent() {
  const router = useRouter();
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const { requests, loading, submitting, deleteRequest, updateRequestStatus, page, setPage, limit, setLimit, search, setSearch, total } = useCertificateRequests({
    page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "",
  });
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  const [statusDlg, setStatusDlg] = useState<CertificateRequest | null>(null);

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search });
  }, [page, limit, search, syncToUrl]);

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
      key: "status",
      header: "Estado",
      render: (request) => <CertificateRequestStatusBadge status={request.status} />,
    },
    {
      key: "actions",
      header: "Acciones",
      className: "text-right w-44",
      render: (request) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-primary hover:text-primary"
            title="Cambiar estado"
            onClick={() => setStatusDlg(request)}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Cambiar estado {request.requestNumber}</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-info hover:text-info"
            onClick={() => router.push(`/solicitudes-certificados/${request.id}/pdf`)}
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

  async function handleStatusChange(payload: { status: CertificateRequestStatus; note?: string }) {
    if (!statusDlg) {
      return;
    }

    const success = await updateRequestStatus(statusDlg, payload);

    if (success) {
      setStatusDlg(null);
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
        />

        <DataTable
          columns={columns}
          data={requests}
          rowKey={(request) => request.id}
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
          entityLabel="solicitud de certificado"
          itemName={selectedRequest?.requestNumber}
          previewEndpoint={selectedRequest ? `/api/certificate-requests/${selectedRequest.id}/delete-preview` : undefined}
          submitting={submitting}
          onClose={() => setSelectedRequest(null)}
          onConfirm={handleDelete}
        />

        <CertificateRequestStatusDialog
          open={Boolean(statusDlg)}
          request={statusDlg}
          submitting={submitting}
          onClose={() => setStatusDlg(null)}
          onConfirm={handleStatusChange}
        />
      </PageContainer>
    </AppLayout>
  );
}

export default function CertificateRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <CertificateRequestsContent />
    </Suspense>
  );
}
