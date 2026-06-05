"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { CertificatesService } from "@/services/certificates.service";
import type { Certificate } from "@/types/certificate";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useCertificates(initial?: { page?: number; limit?: number; search?: string; nombre?: string; documento?: string; mz?: string; lote?: string }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 5);
  const [search, setSearch] = useState(initial?.search ?? "");
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [documento, setDocumento] = useState(initial?.documento ?? "");
  const [mz, setMz] = useState(initial?.mz ?? "");
  const [lote, setLote] = useState(initial?.lote ?? "");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await CertificatesService.list({
        page, limit, search, name: nombre, documentNumber: documento, mz, lot: lote,
      });
      setCertificates(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudieron cargar los certificados"));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, nombre, documento, mz, lote]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const result = await CertificatesService.list({
          page, limit, search, name: nombre, documentNumber: documento, mz, lot: lote,
        });
        if (!cancelled) {
          setCertificates(result.data);
          setTotal(result.total);
          setTotalPages(result.totalPages);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "No se pudieron cargar los certificados"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [page, limit, search, nombre, documento, mz, lote]);

  async function deleteCertificate(certificate: Certificate) {
    setSubmitting(true);

    try {
      await CertificatesService.remove(certificate.id);
      await loadCertificates();
      toast.success(`Certificado ${certificate.certificateNumber} eliminado`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo eliminar el certificado"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function updateCertificateStatus(certificate: Certificate, status: string) {
    setSubmitting(true);

    try {
      await CertificatesService.updateStatus(certificate.id, status);
      await loadCertificates();
      toast.success(`Estado de ${certificate.certificateNumber} actualizado`);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo actualizar el estado"));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    certificates,
    loading,
    submitting,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    nombre,
    setNombre,
    documento,
    setDocumento,
    mz,
    setMz,
    lote,
    setLote,
    total,
    totalPages,
    deleteCertificate,
    updateCertificateStatus,
  };
}
