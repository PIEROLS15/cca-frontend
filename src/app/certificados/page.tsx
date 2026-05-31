"use client";

import { useState } from "react";
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
import { useCertificates } from "@/hooks/use-certificates";
import { CertificatesService } from "@/services/certificates.service";
import { formatDateTime } from "@/lib/utils";
import type { Certificate, CertificateStatus } from "@/types/certificate";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function CertificatesPage() {
  const [search, setSearch] = useState("");
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [mz, setMz] = useState("");
  const [lote, setLote] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [statusDlg, setStatusDlg] = useState<Certificate | null>(null);
  const { certificates, loading, submitting, deleteCertificate, updateCertificateStatus } = useCertificates();

  const filteredCertificates = certificates.filter((cert) => {
    const s = search.toLowerCase();
    if (s && !cert.certificateNumber.toLowerCase().includes(s) && !cert.owners.some((o) => o.fullName.toLowerCase().includes(s))) {
      return false;
    }
    if (nombre && !cert.owners.some((o) => o.fullName.toLowerCase().includes(nombre.toLowerCase()))) {
      return false;
    }
    if (documento && !cert.owners.some((o) => o.documentNumber.includes(documento))) {
      return false;
    }
    if (mz && !(cert.location.mz ?? "").toLowerCase().includes(mz.toLowerCase())) {
      return false;
    }
    if (lote && !(cert.location.lot ?? "").toLowerCase().includes(lote.toLowerCase())) {
      return false;
    }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const currentCertificates = filteredCertificates.slice((safePage - 1) * pageSize, safePage * pageSize);

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
          <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="lg:w-44" />
          <Input placeholder="DNI / RUC" value={documento} onChange={(e) => setDocumento(e.target.value)} className="lg:w-40" />
          <Input placeholder="Mz" value={mz} onChange={(e) => setMz(e.target.value)} className="lg:w-24" />
          <Input placeholder="Lote" value={lote} onChange={(e) => setLote(e.target.value)} className="lg:w-24" />
        </SearchFilters>

        <DataTable
          columns={columns}
          data={currentCertificates}
          rowKey={(cert) => cert.id}
          loading={loading}
          loadingText="Cargando certificados..."
          emptyText="Sin resultados"
        />

        {!loading && (
          <PaginationControls
            page={safePage}
            pageSize={pageSize}
            totalItems={filteredCertificates.length}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
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
