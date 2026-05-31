"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { CertificatesService } from "@/services/certificates.service";
import type { Certificate } from "@/types/certificate";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCertificates() {
      try {
        const data = await CertificatesService.listAll();

        if (!cancelled) {
          setCertificates(data);
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
    }

    void loadCertificates();

    return () => {
      cancelled = true;
    };
  }, []);

  const reloadCertificates = useCallback(async () => {
    const data = await CertificatesService.listAll();
    setCertificates(data);
  }, []);

  async function deleteCertificate(certificate: Certificate) {
    setSubmitting(true);

    try {
      await CertificatesService.remove(certificate.id);
      await reloadCertificates();
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
      await reloadCertificates();
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
    deleteCertificate,
    updateCertificateStatus,
    reloadCertificates,
  };
}
