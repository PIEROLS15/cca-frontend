"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, Eye, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CertificateStatusBadge } from "@/components/certificados/CertificateStatusBadge";
import { StatusChangeDialog } from "@/components/certificados/StatusChangeDialog";
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import { useCertificates } from "@/hooks/use-certificates";
import { CertificatesService } from "@/services/certificates.service";
import { RolesService } from "@/services/roles.service";
import { SectorsService } from "@/services/sectors.service";
import { useSession } from "@/context/session-context";
import { formatDateTime } from "@/lib/utils";
import type { Certificate, CertificateStatus } from "@/types/certificate";
import type { Sector } from "@/types/sector";
import type { Role } from "@/types/user";

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}

function normalizeFilterValue(value: string | null | undefined) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
}

function toSectorUrlValue(name: string) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function toRoleUrlValue(name: string) {
  return String(name || "").replace(/[^a-zA-Z0-9]+/g, "");
}

function formatSequence(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric <= 0) return null;
  return String(numeric).padStart(6, "0");
}

function CertificatesContent() {
  const { user } = useSession();
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const canEditCertificates = user?.role.group !== 4;
  const showRoleFilter = user?.role.group !== 4;
  const sectorParam = readParam("sector");
  const createdByParam = readParam("createdBy");
  const legacySectorId = readNumParam("sectorId", 0) || undefined;
  const legacyCreatedByRoleId = readNumParam("createdByRoleId", 0) || undefined;
  const {
    certificates, loading, submitting, deleteCertificate, updateCertificateStatus,
    page, setPage, limit, setLimit,
    search, setSearch,
    documento, setDocumento,
    mz, setMz,
    lote, setLote,
    sectorId, setSectorId,
    createdByRoleId, setCreatedByRoleId,
    total,
  } = useCertificates({
    page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "",
    documento: readParam("documento") ?? "",
    mz: readParam("mz") ?? "", lote: readParam("lote") ?? "",
    sectorId: legacySectorId,
    createdByRoleId: showRoleFilter ? legacyCreatedByRoleId : undefined,
  });

  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [statusDlg, setStatusDlg] = useState<Certificate | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [catalogsLoaded, setCatalogsLoaded] = useState(false);
  const hydratedSectorParamRef = useRef<string | null>(null);
  const hydratedCreatedByParamRef = useRef<string | null>(null);
  const certificateRangeStart = user?.certificateRangeStart ?? null;
  const certificateRangeEnd = user?.certificateRangeEnd ?? null;
  const lastCertificate = formatSequence(user?.lastCertificate);
  const currentLastNumeric = lastCertificate ? Number(lastCertificate) : null;
  const nextCertificate = canEditCertificates && certificateRangeStart !== null && certificateRangeEnd !== null
    ? formatSequence(Math.max(currentLastNumeric ?? 0, certificateRangeStart - 1) + 1)
    : null;
  const remainingCount = canEditCertificates && certificateRangeStart !== null && certificateRangeEnd !== null
    ? Math.max(certificateRangeEnd - Math.max(currentLastNumeric ?? 0, certificateRangeStart - 1), 0)
    : null;

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogs() {
      try {
        if (showRoleFilter) {
          const loadedRoles = await RolesService.listAll();
          if (!cancelled) {
            setRoles(loadedRoles);
          }
        }
      } catch {
        if (!cancelled) {
          setRoles([]);
        }
      }

      try {
        const sectorsResult = await SectorsService.list({ page: 1, limit: 100 });
        if (!cancelled) {
          setSectors(sectorsResult.data);
        }
      } catch {
        if (!cancelled) {
          setSectors([]);
        }
      }

      if (!cancelled) {
        setCatalogsLoaded(true);
      }
    }

    void loadCatalogs();

    return () => {
      cancelled = true;
    };
  }, [showRoleFilter]);

  useEffect(() => {
    if (legacySectorId || !sectorParam || sectors.length === 0) return;
    if (hydratedSectorParamRef.current === sectorParam) return;

    const matchedSector = sectors.find((sector) => normalizeFilterValue(sector.name) === normalizeFilterValue(sectorParam));
    if (matchedSector) {
      hydratedSectorParamRef.current = sectorParam;

      if (sectorId !== matchedSector.id) {
        setSectorId(matchedSector.id);
      }
    }
  }, [legacySectorId, sectorParam, sectors, sectorId, setSectorId]);

  useEffect(() => {
    if (!sectorParam) {
      hydratedSectorParamRef.current = null;
    }
  }, [sectorParam]);

  useEffect(() => {
    if (legacyCreatedByRoleId || !createdByParam || roles.length === 0) return;
    if (hydratedCreatedByParamRef.current === createdByParam) return;

    const matchedRole = roles.find((role) => normalizeFilterValue(role.name) === normalizeFilterValue(createdByParam));
    if (matchedRole) {
      hydratedCreatedByParamRef.current = createdByParam;

      if (createdByRoleId !== matchedRole.id) {
        setCreatedByRoleId(matchedRole.id);
      }
    }
  }, [legacyCreatedByRoleId, createdByParam, roles, createdByRoleId, setCreatedByRoleId]);

  useEffect(() => {
    if (!createdByParam) {
      hydratedCreatedByParamRef.current = null;
    }
  }, [createdByParam]);

  useEffect(() => {
    if (!catalogsLoaded) return;

    const selectedSector = sectorId !== undefined ? sectors.find((sector) => sector.id === sectorId) : undefined;
    const selectedRole = createdByRoleId !== undefined ? roles.find((role) => role.id === createdByRoleId) : undefined;

    syncToUrl({
      page: page > 1 ? page : undefined,
      limit: limit !== 5 ? limit : undefined,
      search,
      documento,
      mz,
      lote,
      sector: selectedSector ? toSectorUrlValue(selectedSector.name) : undefined,
      createdBy: selectedRole ? toRoleUrlValue(selectedRole.name) : undefined,
    });
  }, [catalogsLoaded, page, limit, search, documento, mz, lote, sectorId, createdByRoleId, sectors, roles, syncToUrl]);

  const roleOptions = useMemo(
    () => roles.map((r) => ({ label: r.name, value: r.id })),
    [roles],
  );

  const sectorOptions = useMemo(
    () => sectors.map((s) => ({ label: s.name, value: s.id })),
    [sectors],
  );

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
      render: (cert) => <span className="font-mono text-xs text-muted-foreground">{cert.owners.map((o) => o.documentNumber).filter(Boolean).join(", ") || "-"}</span>,
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
          {canEditCertificates && (
            <>
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
            </>
          )}
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

  async function handleDownloadReport() {
    try {
      setDownloadingReport(true);
      const { blob, filename } = await CertificatesService.downloadReport({
        search: search || undefined,
        documentNumber: documento || undefined,
        mz: mz || undefined,
        lot: lote || undefined,
        sectorId,
        createdByRoleId,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo descargar el reporte"));
    } finally {
      setDownloadingReport(false);
    }
  }

  return (
    <AppLayout>
      <PageContainer
        title="Certificados"
        description="Gestión de certificados emitidos a comuneros y terceros."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canEditCertificates && (
              <Button type="button" variant="outline" className="gap-1.5" onClick={handleDownloadReport} disabled={downloadingReport}>
                <Download className="h-4 w-4" /> {downloadingReport ? "Descargando..." : "Descargar Certificados"}
              </Button>
            )}
            {canEditCertificates && (
              <Button asChild className="gap-1.5">
                <Link href="/certificados/nuevo">
                  <Plus className="h-4 w-4" /> Agregar certificado
                </Link>
              </Button>
            )}
          </div>
        }
      >
        {canEditCertificates && (
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Límite</div>
            <div className="mt-1 text-sm font-medium">
              {certificateRangeStart !== null && certificateRangeEnd !== null
                ? `${formatSequence(certificateRangeStart)} - ${formatSequence(certificateRangeEnd)}`
                : "Sin límite asignado"}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Último emitido</div>
            <div className="mt-1 text-sm font-medium">{lastCertificate || "—"}</div>
          </div>
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Próximo / restantes</div>
            <div className="mt-1 text-sm font-medium">
              {nextCertificate
                ? remainingCount === 0
                  ? "Límite alcanzado"
                  : `${nextCertificate} · ${remainingCount ?? 0} restantes`
                : "Sin disponibilidad"}
            </div>
          </div>
          </div>
        )}

        <SearchFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onClear={() => {
            setSearch("");
            setDocumento("");
            setMz("");
            setLote("");
            setSectorId(undefined);
            setCreatedByRoleId(undefined);
            setPage(1);
            syncToUrl({
              page: undefined,
              limit: limit !== 5 ? limit : undefined,
              search: undefined,
              documento: undefined,
              mz: undefined,
              lote: undefined,
              sector: undefined,
              createdBy: undefined,
              sectorId: undefined,
              createdByRoleId: undefined,
            });
          }}
          placeholder="Código o nombre..."
        >
          <Input placeholder="DNI / RUC" value={documento} onChange={(e) => { setDocumento(e.target.value); setPage(1); }} className="lg:w-40" />
          <Input placeholder="Mz" value={mz} onChange={(e) => { setMz(e.target.value); setPage(1); }} className="lg:w-24" />
          <Input placeholder="Lote" value={lote} onChange={(e) => { setLote(e.target.value); setPage(1); }} className="lg:w-24" />
          <Select
            value={sectorId !== undefined ? String(sectorId) : "all"}
            onValueChange={(v) => { setSectorId(v === "all" ? undefined : Number(v)); setPage(1); }}
          >
            <SelectTrigger className="lg:w-56">
              <SelectValue placeholder="Ubicación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {sectorOptions.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showRoleFilter && (
            <Select
              value={createdByRoleId !== undefined ? String(createdByRoleId) : "all"}
              onValueChange={(v) => { setCreatedByRoleId(v === "all" ? undefined : Number(v)); setPage(1); }}
            >
              <SelectTrigger className="lg:w-44">
                <SelectValue placeholder="Rol creador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                {roleOptions.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
          previewEndpoint={selectedCertificate ? `/api/certificates/${selectedCertificate.id}/delete-preview` : undefined}
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
