"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CertificateStatusBadge } from "@/components/certificados/CertificateStatusBadge";
import { StatusChangeDialog } from "@/components/certificados/StatusChangeDialog";
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import { useCertificates } from "@/hooks/use-certificates";
import { CertificatesService } from "@/services/certificates.service";
import { formatDateTime } from "@/lib/utils";
import type { Certificate, CertificateStatus } from "@/types/certificate";

function CertificatesContent() {
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const {
    certificates, loading, submitting, deleteCertificate, updateCertificateStatus,
    page, setPage, limit, setLimit,
    search, setSearch,
    nombre, setNombre,
    documento, setDocumento,
    mz, setMz,
    lote, setLote,
    total, totalPages,
  } = useCertificates({
    page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "",
    nombre: readParam("nombre") ?? "", documento: readParam("documento") ?? "",
    mz: readParam("mz") ?? "", lote: readParam("lote") ?? "",
  });

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search, nombre, documento, mz, lote });
  }, [page, limit, search, nombre, documento, mz, lote, syncToUrl]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [statusDlg, setStatusDlg] = useState<Certificate | null>(null);

  const columns: DataTableColumn<Certificate>[] = [
    {
      key: "certificateNumber",
      header: "Código",
      render: (cert) => <span className="font-mono text-xs">{cert.certificateNumber}</span>,
    },
    {
      key: "owners",
      header: "Titular",
      render: (cert) => <span className="font-medium text-xs">{cert.owners.map((o) => o.fullName).join(", ") || "-"}</span>,
    },
    {
      key: "documento",
      header: "Documento",
      render: (cert) => <span className="font-mono text-xs text-muted-foreground">{cert.owners[0]?.documentNumber || "-"}</span>,
    },
    {
      key: "sector",
      header: "Ubicación",
      render: (cert) => <span className="text-xs">{cert.location.sectors?.name || "-"}</span>,
    },
    {
      key: "mz",
      header: "Mz",
      render: (cert) => <span className="text-xs text-muted-foreground">{cert.location.mz || "-"}</span>,
    },
    {
      key: "lot",
      header: "Lote",
      render: (cert) => <span className="text-xs text-muted-foreground">{cert.location.lot || "-"}</span>,
    },
    {
      key: "terrainType",
      header: "Tipo",
      render: (cert) => <span className="text-xs">{cert.terrain.terrainType?.name || "-"}</span>,
    },
    {
      key: "createdAt",
      header: "Fecha",
      render: (cert) => (
        <div className="text-xs text-muted-foreground leading-tight">
          <div>{formatDateTime(cert.createdAt)}</div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      render: (cert) => <CertificateStatusBadge status={cert.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right w-36",
      render: (cert) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-primary hover:text-primary"
            title="Cambiar estado"
            onClick={() => setStatusDlg(cert)}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Cambiar estado {cert.certificateNumber}</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-info hover:text-info"
            title="Ver PDF"
            onClick={() => window.open(CertificatesService.getPdfUrl(cert.id, cert.certificateNumber), "_blank", "noopener,noreferrer")}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver PDF {cert.certificateNumber}</span>
          </Button>
          <Button asChild type="button" size="icon" variant="ghost" className="h-8 w-8 text-warning hover:text-warning">
            <Link href={`/certificados/${cert.id}/editar`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar {cert.certificateNumber}</span>
            </Link>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setSelectedCertificate(cert)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {cert.certificateNumber}</span>
          </Button>
        </div>
      ),
    },
  ];

  async function handleDelete() {
    if (!selectedCertificate) return;

    const success = await deleteCertificate(selectedCertificate);

    if (success) {
      setSelectedCertificate(null);
    }
  }

  async function handleStatusChange(status: CertificateStatus) {
    if (!statusDlg) return;

    const success = await updateCertificateStatus(statusDlg, status);

    if (success) {
      setStatusDlg(null);
    }
  }

  return (
    <AppLayout>
      <PageContainer
        title="Certificados"
        description="Gestión de certificados emitidos a comuneros y terceros."
        actions={
          <Button asChild className="gap-1.5">
            <Link href="/certificados/nuevo">
              <Plus className="h-4 w-4" /> Agregar certificado
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
            setNombre("");
            setDocumento("");
            setMz("");
            setLote("");
            setPage(1);
          }}
          placeholder="Código o nombre..."
        >
          <Input placeholder="Nombre" value={nombre} onChange={(e) => { setNombre(e.target.value); setPage(1); }} className="lg:w-44" />
          <Input placeholder="DNI / RUC" value={documento} onChange={(e) => { setDocumento(e.target.value); setPage(1); }} className="lg:w-40" />
          <Input placeholder="Mz" value={mz} onChange={(e) => { setMz(e.target.value); setPage(1); }} className="lg:w-24" />
          <Input placeholder="Lote" value={lote} onChange={(e) => { setLote(e.target.value); setPage(1); }} className="lg:w-24" />
        </SearchFilters>

        <DataTable
          columns={columns}
          data={certificates}
          rowKey={(cert) => cert.id}
          loading={loading}
          loadingText="Cargando certificados..."
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
          open={Boolean(selectedCertificate)}
          entityLabel="certificado"
          itemName={selectedCertificate?.certificateNumber}
          submitting={submitting}
          onClose={() => setSelectedCertificate(null)}
          onConfirm={handleDelete}
        />

        <StatusChangeDialog
          open={Boolean(statusDlg)}
          certificate={statusDlg}
          submitting={submitting}
          onClose={() => setStatusDlg(null)}
          onConfirm={handleStatusChange}
        />
      </PageContainer>
    </AppLayout>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <CertificatesContent />
    </Suspense>
  );
}
