"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AssemblyRecordRequestsService } from "@/services/assembly-record-requests.service";
import { CertificatesService } from "@/services/certificates.service";
import type { Certificate } from "@/types/certificate";

export interface AssemblyRecordFormState {
  certificateNumber: string;
  esComunero: "si" | "no" | "";
  description: string;
  comprador: string;
  vendedor: string;
  ubicacion: string;
  tipoTerreno: string;
  ancho: string;
  largo: string;
  areaTotal: string;
  fechaAdjudicacion: string;
  tiempoPosesion: string;
  correo: string;
  telefono: string;
  adjuntos: {
    certPosesion: boolean;
    planoMemoria: boolean;
    dniCompradores: boolean;
    dniVendedor: boolean;
    contratoCV: boolean;
    testimonio: boolean;
    observacionRegistros: boolean;
  };
  selectedCertificate: Certificate | null;
}

const emptyForm: AssemblyRecordFormState = {
  certificateNumber: "",
  esComunero: "",
  description: "",
  comprador: "",
  vendedor: "",
  ubicacion: "",
  tipoTerreno: "",
  ancho: "",
  largo: "",
  areaTotal: "",
  fechaAdjudicacion: "",
  tiempoPosesion: "",
  correo: "",
  telefono: "",
  adjuntos: {
    certPosesion: false,
    planoMemoria: false,
    dniCompradores: false,
    dniVendedor: false,
    contratoCV: false,
    testimonio: false,
    observacionRegistros: false,
  },
  selectedCertificate: null,
};

interface UseAssemblyRecordFormOptions {
  mode: "create" | "edit";
  requestId?: number;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useAssemblyRecordForm({ mode, requestId }: UseAssemblyRecordFormOptions) {
  const router = useRouter();
  const [form, setForm] = useState<AssemblyRecordFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const updateField = useCallback(<K extends keyof AssemblyRecordFormState>(
    field: K,
    value: AssemblyRecordFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateAdjunto = useCallback((key: keyof AssemblyRecordFormState["adjuntos"], checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      adjuntos: { ...prev.adjuntos, [key]: checked },
    }));
  }, []);

  const searchCertificate = useCallback(async () => {
    const number = form.certificateNumber.trim();

    if (!number) {
      toast.error("Ingrese un número de certificado");
      return;
    }

    setSearching(true);

    try {
      const certificate = await CertificatesService.lookupByNumber(number);
      const ownerName = certificate.owners.map((o) => o.fullName).join(", ");
      const area = certificate.terrain.totalArea
        ? String(certificate.terrain.totalArea)
        : (certificate.terrain.width && certificate.terrain.length
          ? String(Number(certificate.terrain.width) * Number(certificate.terrain.length))
          : "");

      setForm((prev) => ({
        ...prev,
        selectedCertificate: certificate,
        comprador: ownerName,
        ubicacion: certificate.location.sectors?.name ?? "",
        tipoTerreno: certificate.terrain.terrainType?.name ?? "",
        ancho: certificate.terrain.width ? String(certificate.terrain.width) : "",
        largo: certificate.terrain.length ? String(certificate.terrain.length) : "",
        areaTotal: area,
        esComunero: "si",
      }));
      toast.success("Certificado encontrado");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se encontró el certificado"));
      setForm((prev) => ({ ...prev, selectedCertificate: null }));
    } finally {
      setSearching(false);
    }
  }, [form.certificateNumber]);

  useEffect(() => {
    if (mode !== "edit" || !requestId) return;

    const id = requestId;
    let cancelled = false;

    async function loadRequest() {
      try {
        const request = await AssemblyRecordRequestsService.getById(id);
        const certificate = await CertificatesService.lookupByNumber(request.certificate.certificateNumber);
        const ownerName = certificate.owners.map((o) => o.fullName).join(", ");
        const area = certificate.terrain.totalArea
          ? String(certificate.terrain.totalArea)
          : (certificate.terrain.width && certificate.terrain.length
            ? String(Number(certificate.terrain.width) * Number(certificate.terrain.length))
            : "");

        if (!cancelled) {
          setForm({
            certificateNumber: request.certificate.certificateNumber,
            esComunero: "si",
            description: request.description ?? "",
            comprador: ownerName,
            vendedor: "",
            ubicacion: certificate.location.sectors?.name ?? "",
            tipoTerreno: certificate.terrain.terrainType?.name ?? "",
            ancho: certificate.terrain.width ? String(certificate.terrain.width) : "",
            largo: certificate.terrain.length ? String(certificate.terrain.length) : "",
            areaTotal: area,
            fechaAdjudicacion: "",
            tiempoPosesion: "",
            correo: "",
            telefono: "",
            adjuntos: {
              certPosesion: false,
              planoMemoria: false,
              dniCompradores: false,
              dniVendedor: false,
              contratoCV: false,
              testimonio: false,
              observacionRegistros: false,
            },
            selectedCertificate: certificate,
          });
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(getErrorMessage(error, "No se pudo cargar la solicitud"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRequest();

    return () => {
      cancelled = true;
    };
  }, [mode, requestId]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const certificate = form.selectedCertificate;

    if (!certificate) {
      toast.error("Debe buscar y seleccionar un certificado válido");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "edit" && requestId) {
        await AssemblyRecordRequestsService.update(requestId, {
          description: form.description || undefined,
        });
        toast.success("Solicitud de acta actualizada");
      } else {
        const clientId = certificate.owners[0]?.id;

        if (!clientId) {
          toast.error("El certificado no tiene un titular asignado");
          setSubmitting(false);
          return;
        }

        await AssemblyRecordRequestsService.create({
          clientId,
          certificateId: certificate.id,
          description: form.description || undefined,
        });
        toast.success("Solicitud de acta creada");
      }

      router.push("/solicitudes-acta");
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo guardar la solicitud"));
    } finally {
      setSubmitting(false);
    }
  }, [form, mode, requestId, router]);

  const handleCancel = useCallback(() => {
    router.push("/solicitudes-acta");
  }, [router]);

  return {
    form,
    loading,
    submitting,
    searching,
    updateField,
    updateAdjunto,
    searchCertificate,
    handleSubmit,
    handleCancel,
  };
}
