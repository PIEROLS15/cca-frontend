"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useSectors } from "@/hooks/use-sectors";
import { useTerrainTypes } from "@/hooks/use-terrain-types";
import { CertificateRequestsService } from "@/services/certificate-requests.service";
import { CertificatesService } from "@/services/certificates.service";
import { ClientsService } from "@/services/clients.service";
import type { Certificate, CertificatePayload } from "@/types/certificate";

export interface OwnerFormState {
  id: number | null;
  fullName: string;
  documentNumber: string;
}

export interface CertificateFormState {
  requestNumber: string;
  owner1: OwnerFormState;
  owner2: OwnerFormState;
  terrainTypeId: string;
  width: string;
  length: string;
  totalArea: string;
  sectorId: string;
  mz: string;
  lot: string;
  north: string;
  south: string;
  east: string;
  west: string;
}

const emptyForm: CertificateFormState = {
  requestNumber: "",
  owner1: { id: null, fullName: "", documentNumber: "" },
  owner2: { id: null, fullName: "", documentNumber: "" },
  terrainTypeId: "",
  width: "",
  length: "",
  totalArea: "",
  sectorId: "",
  mz: "",
  lot: "",
  north: "",
  south: "",
  east: "",
  west: "",
};

function mapCertificateToForm(certificate: Certificate): CertificateFormState {
  return {
    requestNumber: certificate.requestNumber || "",
    owner1: {
      id: certificate.owners[0]?.id ?? null,
      fullName: certificate.owners[0]?.fullName || "",
      documentNumber: certificate.owners[0]?.documentNumber || "",
    },
    owner2: {
      id: certificate.owners[1]?.id ?? null,
      fullName: certificate.owners[1]?.fullName || "",
      documentNumber: certificate.owners[1]?.documentNumber || "",
    },
    terrainTypeId: String(certificate.terrain.terrainType?.id ?? ""),
    width: certificate.terrain.width != null ? String(certificate.terrain.width) : "",
    length: certificate.terrain.length != null ? String(certificate.terrain.length) : "",
    totalArea: certificate.terrain.totalArea != null ? String(certificate.terrain.totalArea) : "",
    sectorId: String(certificate.location.sectors?.id ?? ""),
    mz: certificate.location.mz || "",
    lot: certificate.location.lot || "",
    north: certificate.borders.north || "",
    south: certificate.borders.south || "",
    east: certificate.borders.east || "",
    west: certificate.borders.west || "",
  };
}

function buildPayload(form: CertificateFormState): CertificatePayload {
  const owners: { id: number }[] = [];

  if (form.owner1.id) {
    owners.push({ id: form.owner1.id });
  }

  if (form.owner2.id) {
    owners.push({ id: form.owner2.id });
  }

  if (owners.length === 0) {
    throw new Error("No hay titulares asignados");
  }

  return {
    owners,
    requestNumber: form.requestNumber.trim(),
    terrain: {
      terrainType: { id: Number(form.terrainTypeId) },
      width: form.width ? Number(form.width) : null,
      length: form.length ? Number(form.length) : null,
      totalArea: form.totalArea ? Number(form.totalArea) : null,
    },
    location: {
      sectors: { id: Number(form.sectorId) },
      mz: form.mz || null,
      lot: form.lot || null,
    },
    borders: {
      north: form.north || null,
      south: form.south || null,
      east: form.east || null,
      west: form.west || null,
    },
  };
}

interface UseCertificateFormOptions {
  mode: "create" | "edit";
  certificateId?: number;
}

export function useCertificateForm({ mode, certificateId }: UseCertificateFormOptions) {
  const router = useRouter();
  const { terrainTypes } = useTerrainTypes();
  const { sectors } = useSectors();
  const [form, setForm] = useState<CertificateFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !certificateId) {
      return;
    }

    const currentCertificateId = certificateId;
    let cancelled = false;

    async function loadCertificate() {
      try {
        const certificate = await CertificatesService.getById(currentCertificateId);

        if (!cancelled) {
          setForm(mapCertificateToForm(certificate));
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "No se pudo cargar el certificado";
          toast.error(message);
          router.push("/certificados");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCertificate();

    return () => {
      cancelled = true;
    };
  }, [certificateId, mode, router]);

  useEffect(() => {
    const width = parseFloat(form.width);
    const length = parseFloat(form.length);
    const nextTotalArea = !Number.isNaN(width) && !Number.isNaN(length)
      ? (width * length).toFixed(2)
      : "";

    if (form.totalArea !== nextTotalArea) {
      setForm((current) => ({ ...current, totalArea: nextTotalArea }));
    }
  }, [form.width, form.length, form.totalArea]);

  function updateField<Key extends keyof CertificateFormState>(field: Key, value: CertificateFormState[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function searchRequest() {
    const code = form.requestNumber.trim();

    if (!code) {
      toast.error("Ingresa un código de solicitud");
      return;
    }

    setSearching(true);

    try {
      const request = await CertificateRequestsService.getById(code);
      const [client, partnerClient] = await Promise.all([
        ClientsService.searchByDocument(request.client.documentNumber),
        request.partnerClient.documentNumber
          ? ClientsService.searchByDocument(request.partnerClient.documentNumber)
          : Promise.resolve(null),
      ]);

      setForm((current) => ({
        ...current,
        owner1: {
          id: client.id,
          fullName: request.client.fullName,
          documentNumber: request.client.documentNumber,
        },
        owner2: {
          id: partnerClient?.id ?? null,
          fullName: request.partnerClient.fullName,
          documentNumber: request.partnerClient.documentNumber,
        },
      }));

      toast.success("Datos cargados correctamente");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se encontró la solicitud";
      toast.error(message);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.requestNumber.trim()) {
      toast.error("El código de solicitud es obligatorio");
      return;
    }

    if (!form.owner1.fullName.trim()) {
      toast.error("Busca una solicitud para cargar los datos del titular");
      return;
    }

    if (!form.terrainTypeId) {
      toast.error("Selecciona el tipo de terreno");
      return;
    }

    if (!form.sectorId) {
      toast.error("Selecciona el sector");
      return;
    }

    let payload: CertificatePayload;

    try {
      payload = buildPayload(form);
    } catch {
      toast.error("Complete los datos del titular");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "edit" && certificateId) {
        await CertificatesService.update(certificateId, payload);
        toast.success("Certificado actualizado");
      } else {
        await CertificatesService.create(payload);
        toast.success("Certificado creado");
      }

      router.push("/certificados");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el certificado";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    form,
    loading,
    submitting,
    searching,
    terrainTypes,
    sectors,
    updateField,
    searchRequest,
    handleSubmit,
  };
}
