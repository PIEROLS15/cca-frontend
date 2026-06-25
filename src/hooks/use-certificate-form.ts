"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ClientsService } from "@/services/clients.service";
import { useSession } from "@/context/session-context";
import { useSectors } from "@/hooks/use-sectors";
import { useTerrainTypes } from "@/hooks/use-terrain-types";
import { CertificateRequestsService } from "@/services/certificate-requests.service";
import { CertificatesService } from "@/services/certificates.service";
import type { Certificate, CertificatePayload } from "@/types/certificate";
import type { PersonaData } from "@/types/client";
import type { TerrainMeasurementMode, TerrainType } from "@/types/terrain-type";

export interface OwnerFormState {
  uid: string;
  id: number | null;
  fullName: string;
  documentNumber: string;
}

export interface CertificateFormState {
  requestNumber: string;
  certificateRequestId: number | null;
  owners: OwnerFormState[];
  terrainTypeId: string;
  measurementModeUsed: TerrainMeasurementMode;
  width: string;
  length: string;
  totalArea: string;
  area: string;
  perimeter: string;
  additionalMeasureEnabled: boolean;
  additionalWidth: string;
  additionalLength: string;
  sectorId: string;
  mz: string;
  lot: string;
  north: string;
  south: string;
  east: string;
  west: string;
}

function createOwnerUid() {
  return globalThis.crypto?.randomUUID?.() || `owner-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createEmptyOwner(): OwnerFormState {
  return { uid: createOwnerUid(), id: null, fullName: "", documentNumber: "" };
}

const emptyForm: CertificateFormState = {
  requestNumber: "",
  certificateRequestId: null,
  owners: [createEmptyOwner()],
  terrainTypeId: "",
  measurementModeUsed: "RECTANGULAR_AUTO",
  width: "",
  length: "",
  totalArea: "",
  area: "",
  perimeter: "",
  additionalMeasureEnabled: false,
  additionalWidth: "",
  additionalLength: "",
  sectorId: "",
  mz: "",
  lot: "",
  north: "",
  south: "",
  east: "",
  west: "",
};

function toInputValue(value: number | null | undefined) {
  return value != null ? String(value) : "";
}

function parseInputNumber(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function resolveModeForTerrainType(terrainType: TerrainType | null | undefined): TerrainMeasurementMode {
  const mode = terrainType?.config?.formMode;
  if (mode === "AREA_PERIMETER" || mode === "MANUAL_TOTAL_AREA") return mode;
  return "RECTANGULAR_AUTO";
}

function mapCertificateToForm(certificate: Certificate): CertificateFormState {
  const mappedOwners = certificate.owners?.length
    ? certificate.owners.map((owner) => ({
        uid: owner.id ? `owner-${owner.id}` : createOwnerUid(),
        id: owner.id ?? null,
        fullName: owner.fullName || "",
        documentNumber: owner.documentNumber || "",
      }))
    : [createEmptyOwner()];

  return {
    requestNumber: certificate.requestNumber || "",
    certificateRequestId: certificate.certificateRequestId || null,
    owners: mappedOwners,
    terrainTypeId: String(certificate.terrain.terrainType?.id ?? ""),
    measurementModeUsed: certificate.terrain.measurementModeUsed || "RECTANGULAR_AUTO",
    width: toInputValue(certificate.terrain.width),
    length: toInputValue(certificate.terrain.length),
    totalArea: toInputValue(certificate.terrain.totalArea),
    area: toInputValue(certificate.terrain.area),
    perimeter: toInputValue(certificate.terrain.perimeter),
    additionalMeasureEnabled: certificate.terrain.additionalWidth != null || certificate.terrain.additionalLength != null,
    additionalWidth: toInputValue(certificate.terrain.additionalWidth),
    additionalLength: toInputValue(certificate.terrain.additionalLength),
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
  return {
    owners: form.owners
      .map((owner) => ({
        id: owner.id,
        fullName: owner.fullName.trim(),
        documentNumber: owner.documentNumber.replace(/\D/g, "").trim(),
      }))
      .filter((owner) => owner.fullName || owner.documentNumber || owner.id != null),
    requestNumber: form.requestNumber.trim(),
    certificateRequestId: form.certificateRequestId,
    terrain: {
      terrainType: { id: Number(form.terrainTypeId) },
      measurementModeUsed: form.measurementModeUsed,
      width: parseInputNumber(form.width),
      length: parseInputNumber(form.length),
      totalArea: parseInputNumber(form.totalArea),
      area: parseInputNumber(form.area),
      perimeter: parseInputNumber(form.perimeter),
      additionalWidth: form.additionalMeasureEnabled ? parseInputNumber(form.additionalWidth) : null,
      additionalLength: form.additionalMeasureEnabled ? parseInputNumber(form.additionalLength) : null,
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

function isOwnerEmpty(owner: OwnerFormState) {
  return !owner.id && !owner.fullName.trim() && !owner.documentNumber.trim();
}

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, "").trim();
}

interface UseCertificateFormOptions {
  mode: "create" | "edit";
  certificateId?: number;
}

export interface OwnerSearchState {
  open: boolean;
  ownerIndex: number | null;
  result: PersonaData | null;
}

export function useCertificateForm({ mode, certificateId }: UseCertificateFormOptions) {
  const router = useRouter();
  const { updateUserData } = useSession();
  const { terrainTypes } = useTerrainTypes({ page: 1, limit: 100 });
  const { sectors } = useSectors({ page: 1, limit: 100 });
  const [form, setForm] = useState<CertificateFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchingOwnerIndex, setSearchingOwnerIndex] = useState<number | null>(null);
  const [ownerSearch, setOwnerSearch] = useState<OwnerSearchState>({ open: false, ownerIndex: null, result: null });
  const previousTerrainTypeId = useRef<string | null>(null);

  const selectedTerrainType = useMemo(
    () => terrainTypes.find((terrainType) => String(terrainType.id) === form.terrainTypeId) || null,
    [terrainTypes, form.terrainTypeId],
  );

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
    if (!selectedTerrainType || !form.terrainTypeId) return;

    const hasPreviousTerrainType = previousTerrainTypeId.current !== null;
    const terrainTypeChanged = previousTerrainTypeId.current !== form.terrainTypeId;

    if (!terrainTypeChanged) return;

    previousTerrainTypeId.current = form.terrainTypeId;

    if (mode === "edit" && !hasPreviousTerrainType) {
      return;
    }

    setForm((current) => ({
      ...current,
      measurementModeUsed: resolveModeForTerrainType(selectedTerrainType),
      width: "",
      length: "",
      totalArea: "",
      area: "",
      perimeter: "",
      additionalMeasureEnabled: false,
      additionalWidth: "",
      additionalLength: "",
      mz: selectedTerrainType.config?.showMzLot === false ? "" : current.mz,
      lot: selectedTerrainType.config?.showMzLot === false ? "" : current.lot,
    }));
  }, [form.terrainTypeId, mode, selectedTerrainType]);

  function updateField<Key extends keyof CertificateFormState>(field: Key, value: CertificateFormState[Key]) {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (
        next.measurementModeUsed !== "RECTANGULAR_AUTO" ||
        (field !== "measurementModeUsed" &&
          field !== "width" &&
          field !== "length" &&
          field !== "additionalMeasureEnabled" &&
          field !== "additionalWidth" &&
          field !== "additionalLength")
      ) {
        return next;
      }

      const width = parseInputNumber(next.width);
      const length = parseInputNumber(next.length);
      const additionalWidth = next.additionalMeasureEnabled ? parseInputNumber(next.additionalWidth) : null;
      const additionalLength = next.additionalMeasureEnabled ? parseInputNumber(next.additionalLength) : null;

      let total = 0;
      let hasAnyMeasure = false;

      if (width != null && length != null) {
        total += width * length;
        hasAnyMeasure = true;
      }

      if (additionalWidth != null && additionalLength != null) {
        total += additionalWidth * additionalLength;
        hasAnyMeasure = true;
      }

      return { ...next, totalArea: hasAnyMeasure ? total.toFixed(2) : "" };
    });
  }

  function updateOwnerField<Key extends keyof OwnerFormState>(index: number, field: Key, value: OwnerFormState[Key]) {
    setForm((current) => ({
      ...current,
      owners: current.owners.map((owner, ownerIndex) => (ownerIndex === index ? { ...owner, [field]: value } : owner)),
    }));
  }

  function addOwner() {
    setForm((current) => ({
      ...current,
      owners: [...current.owners, createEmptyOwner()],
    }));
  }

  function removeOwner(index: number) {
    setForm((current) => {
      if (current.owners.length <= 1) return current;
      const nextOwners = current.owners.filter((_, ownerIndex) => ownerIndex !== index);
      return { ...current, owners: nextOwners.length > 0 ? nextOwners : [createEmptyOwner()] };
    });
  }

  async function searchOwnerByDocument(index: number) {
    const owner = form.owners[index];
    const documentNumber = owner?.documentNumber.trim();

    if (!documentNumber) {
      toast.error("Ingresa el DNI del dueño");
      return;
    }

    setSearchingOwnerIndex(index);

    try {
      const result = await ClientsService.searchReniec(documentNumber);
      setOwnerSearch({ open: true, ownerIndex: index, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se encontró el cliente";
      toast.error(message);
    } finally {
      setSearchingOwnerIndex(null);
    }
  }

  function closeOwnerSearch() {
    setOwnerSearch({ open: false, ownerIndex: null, result: null });
  }

  function acceptOwnerSearch() {
    const { ownerIndex, result } = ownerSearch;

    if (ownerIndex == null || !result) {
      return;
    }

    setForm((current) => ({
      ...current,
      owners: current.owners.map((owner, index) => (
        index === ownerIndex
          ? { ...owner, fullName: result.fullName, documentNumber: result.documentNumber }
          : owner
      )),
    }));

    closeOwnerSearch();
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

      setForm((current) => ({
        ...current,
        certificateRequestId: request.id,
        requestNumber: request.requestNumber,
        owners: [
          {
            uid: request.client.id ? `owner-${request.client.id}` : createOwnerUid(),
            id: request.client.id ?? null,
            fullName: request.client.fullName,
            documentNumber: request.client.documentNumber,
          },
          ...(request.partnerClient.documentNumber
            ? [{
                uid: request.partnerClient.id ? `owner-${request.partnerClient.id}` : createOwnerUid(),
                id: request.partnerClient.id ?? null,
                fullName: request.partnerClient.fullName,
                documentNumber: request.partnerClient.documentNumber,
              }]
            : []),
          ...current.owners.slice(2),
        ],
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

    if (!form.terrainTypeId) {
      toast.error("Selecciona el tipo de terreno");
      return;
    }

    if (!form.sectorId) {
      toast.error("Selecciona el sector");
      return;
    }

    let payload;
    try {
      const owners = form.owners.filter((owner) => !isOwnerEmpty(owner));

      if (owners.length === 0) {
        throw new Error("No hay titulares asignados");
      }

      for (const owner of owners) {
        if (!owner.fullName.trim()) {
          throw new Error("Cada dueño debe tener nombres y DNI");
        }

        if (!normalizeDocumentNumber(owner.documentNumber)) {
          throw new Error("Cada dueño debe tener DNI");
        }
      }

      payload = buildPayload({ ...form, owners });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Complete los datos de los dueños";
      toast.error(message);
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "edit" && certificateId) {
        await CertificatesService.update(certificateId, payload);
        toast.success("Certificado actualizado");
      } else {
        const created = await CertificatesService.create(payload);
        updateUserData({ lastCertificate: created.certificateNumber });
        toast.success("Certificado creado");
        router.push(`/certificados/${created.id}/pdf`);
        return;
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
    searchingOwnerIndex,
    ownerSearch,
    terrainTypes,
    sectors,
    updateField,
    updateOwnerField,
    addOwner,
    removeOwner,
    searchOwnerByDocument,
    closeOwnerSearch,
    acceptOwnerSearch,
    searchRequest,
    handleSubmit,
  };
}
