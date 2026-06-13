"use client";

import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AssemblyRecordRequestsService } from "@/services/assembly-record-requests.service";
import { CertificatesService } from "@/services/certificates.service";
import type { AssemblyRecordAttachment } from "@/types/assembly-record-request";
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

const ATTACHMENT_TOKEN_BY_KEY: Record<keyof AssemblyRecordFormState["adjuntos"], string> = {
  certPosesion: "CertPosesion",
  planoMemoria: "PlanoMemoria",
  dniCompradores: "DniCompradores",
  dniVendedor: "DniVendedor",
  contratoCV: "ContratoCV",
  testimonio: "Testimonio",
  observacionRegistros: "ObservacionRegistros",
};

const ATTACHMENT_KEY_BY_TOKEN: Record<string, keyof AssemblyRecordFormState["adjuntos"]> = {
  certposesion: "certPosesion",
  planomemoria: "planoMemoria",
  dnicompradores: "dniCompradores",
  dnivendedor: "dniVendedor",
  contratocv: "contratoCV",
  testimonio: "testimonio",
  observacionregistros: "observacionRegistros",
};

interface UseAssemblyRecordFormOptions {
  mode: "create" | "edit";
  requestId?: number;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function normalizeAttachmentToken(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
}

function buildAdjuntosFromAttachments(attachments: AssemblyRecordAttachment[] | undefined) {
  const adjuntos = { ...emptyForm.adjuntos };

  for (const attachment of attachments || []) {
    const key = ATTACHMENT_KEY_BY_TOKEN[normalizeAttachmentToken(attachment.type)];
    if (key) {
      adjuntos[key] = true;
    }
  }

  return adjuntos;
}

function buildAttachmentsPayload(adjuntos: AssemblyRecordFormState["adjuntos"]): AssemblyRecordAttachment[] {
  return (Object.entries(adjuntos) as Array<[keyof AssemblyRecordFormState["adjuntos"], boolean]>)
    .filter(([, checked]) => checked)
    .map(([key]) => ({ type: ATTACHMENT_TOKEN_BY_KEY[key] }));
}

function toInputDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function toOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function isComunero(value: string) {
  return String(value || "").trim().toLowerCase() === "comunero";
}

export function useAssemblyRecordForm({ mode, requestId }: UseAssemblyRecordFormOptions) {
  const router = useRouter();
  const [form, setForm] = useState<AssemblyRecordFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  const updateField = useCallback(<K extends keyof AssemblyRecordFormState>(field: K, value: AssemblyRecordFormState[K]) => {
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
      const area = certificate.terrain.area
        ? String(certificate.terrain.area)
        : certificate.terrain.totalArea
          ? String(certificate.terrain.totalArea)
          : certificate.terrain.width && certificate.terrain.length
            ? String(Number(certificate.terrain.width) * Number(certificate.terrain.length))
            : "";

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
        const area = certificate.terrain.area
          ? String(certificate.terrain.area)
          : certificate.terrain.totalArea
            ? String(certificate.terrain.totalArea)
            : certificate.terrain.width && certificate.terrain.length
              ? String(Number(certificate.terrain.width) * Number(certificate.terrain.length))
              : "";

        if (!cancelled) {
          setForm({
            certificateNumber: request.certificate.certificateNumber,
            esComunero: isComunero(request.typeUser) ? "si" : "no",
            description: request.description ?? "",
            comprador: request.buyerFullName ?? ownerName,
            vendedor: request.sellerFullName ?? "",
            ubicacion: request.sectorLocation ?? certificate.location.sectors?.name ?? "",
            tipoTerreno: request.terrainType ?? certificate.terrain.terrainType?.name ?? "",
            ancho: certificate.terrain.width ? String(certificate.terrain.width) : "",
            largo: certificate.terrain.length ? String(certificate.terrain.length) : "",
            areaTotal: area,
            fechaAdjudicacion: toInputDate(request.awardDate),
            tiempoPosesion: request.possessionTime ?? "",
            correo: request.email ?? "",
            telefono: request.phone ?? "",
            adjuntos: buildAdjuntosFromAttachments(request.attachments),
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

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const certificate = form.selectedCertificate;

    if (!certificate) {
      toast.error("Debe buscar y seleccionar un certificado válido");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        certificateId: certificate.id,
        clientId: certificate.owners[0]?.id,
        description: toOptionalText(form.description),
        buyerFullName: toOptionalText(form.comprador),
        sellerFullName: toOptionalText(form.vendedor),
        sectorLocation: toOptionalText(form.ubicacion),
        terrainType: toOptionalText(form.tipoTerreno),
        awardDate: form.fechaAdjudicacion || undefined,
        possessionTime: toOptionalText(form.tiempoPosesion),
        email: toOptionalText(form.correo),
        phone: toOptionalText(form.telefono),
        attachments: buildAttachmentsPayload(form.adjuntos),
      };

      if (mode === "edit" && requestId) {
        await AssemblyRecordRequestsService.update(requestId, payload);
        toast.success("Solicitud de acta actualizada");
      } else {
        if (!payload.clientId) {
          toast.error("El certificado no tiene un titular asignado");
          return;
        }

        await AssemblyRecordRequestsService.create(payload);
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
