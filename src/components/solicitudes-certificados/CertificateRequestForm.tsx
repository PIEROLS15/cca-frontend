"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BuscarPersonaDialog } from "@/components/ui/BuscarPersonaDialog";
import { AgregarClienteDialog } from "@/components/solicitudes-certificados/AgregarClienteDialog";
import { CertificateRequestsService } from "@/services/certificate-requests.service";
import type { PersonaData } from "@/types/client";
import type {
  CertificateRequest,
  CertificateRequestAttachment,
  CertificateRequestCertificateType,
  CertificateRequestPayload,
  CertificateRequestPerson,
} from "@/types/certificate-request";

const CERTIFICATE_TYPE_OPTIONS = [
  { key: "posesion", label: "Certificado de Posesión", value: "CertificadoPosesion" },
  { key: "planoMemoria", label: "Plano y Memoria", value: "PlanoMemoria" },
  { key: "otros", label: "Otros", value: "Otros" },
] as const;

const ATTACHMENT_OPTIONS = [
  { key: "certAnterior", label: "Copia de certificado anterior", value: "CertAnterior" },
  { key: "dni", label: "Copia de DNI", value: "CopiaDni" },
  { key: "compraVenta", label: "Contrato de compra-venta notariado", value: "CompraVenta" },
  { key: "planoMemoria", label: "Copia de plano y memoria", value: "CopiaPlanoMemoria" },
] as const;

type CertificateTypeKey = typeof CERTIFICATE_TYPE_OPTIONS[number]["key"];
type AttachmentKey = typeof ATTACHMENT_OPTIONS[number]["key"];

interface PersonFormState {
  fullName: string;
  documentNumber: string;
  address: string;
}

interface CertificateRequestFormState {
  isComunero: "si" | "no" | "";
  destination: "Ingeniero" | "Secretaria" | "";
  requestDescription: string;
  certificateTypes: Record<CertificateTypeKey, boolean>;
  otherCertificateType: string;
  sectorLocation: string;
  exposure: string;
  attachments: Record<AttachmentKey | "celular", boolean>;
  phoneNumber: string;
  client: PersonFormState;
  partnerClient: PersonFormState;
}

const emptyPerson: PersonFormState = {
  fullName: "",
  documentNumber: "",
  address: "",
};

const emptyForm: CertificateRequestFormState = {
  isComunero: "",
  destination: "",
  requestDescription: "",
  certificateTypes: {
    posesion: false,
    planoMemoria: false,
    otros: false,
  },
  otherCertificateType: "",
  sectorLocation: "",
  exposure: "",
  attachments: {
    certAnterior: false,
    dni: false,
    compraVenta: false,
    planoMemoria: false,
    celular: false,
  },
  phoneNumber: "",
  client: emptyPerson,
  partnerClient: emptyPerson,
};

interface CertificateRequestFormProps {
  mode: "create" | "edit";
  requestId?: string;
}

function sectionTitle(text: string) {
  return <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{text}</h3>;
}

function mapRequestToForm(request: CertificateRequest): CertificateRequestFormState {
  const certificateTypeValues = request.certificateTypes.map((item) => item.type.toLowerCase());
  const attachmentValues = request.attachments.map((item) => item.type.toLowerCase());
  const cellphoneAttachment = request.attachments.find((item) => item.type.toLowerCase() === "celular");
  const otherType = request.certificateTypes.find((item) => item.type.toLowerCase() === "otros")?.otherType || "";

  return {
    isComunero: request.isComunero ? "si" : "no",
    destination: request.destination === "Ingeniero" || request.destination === "Secretaria"
      ? request.destination
      : "",
    requestDescription: request.requestDescription,
    certificateTypes: {
      posesion: certificateTypeValues.includes("certificadoposesion"),
      planoMemoria: certificateTypeValues.includes("planomemoria"),
      otros: certificateTypeValues.includes("otros"),
    },
    otherCertificateType: otherType,
    sectorLocation: request.sectorLocation,
    exposure: request.exposure,
    attachments: {
      certAnterior: attachmentValues.includes("certanterior"),
      dni: attachmentValues.includes("copiadni"),
      compraVenta: attachmentValues.includes("compraventa"),
      planoMemoria: attachmentValues.includes("copiaplanomemoria"),
      celular: attachmentValues.includes("celular"),
    },
    phoneNumber: cellphoneAttachment?.phoneNumber || "",
    client: {
      fullName: request.client.fullName,
      documentNumber: request.client.documentNumber,
      address: request.client.address,
    },
    partnerClient: {
      fullName: request.partnerClient.fullName,
      documentNumber: request.partnerClient.documentNumber,
      address: request.partnerClient.address,
    },
  };
}

function buildPersonPayload(person: PersonFormState): CertificateRequestPerson {
  return {
    searchType: "Comunidad",
    fullName: person.fullName.trim(),
    documentNumber: person.documentNumber.trim(),
    address: person.address.trim(),
  };
}

function buildCertificateTypesPayload(
  certificateTypes: CertificateRequestFormState["certificateTypes"],
  otherCertificateType: string,
): CertificateRequestCertificateType[] {
  return CERTIFICATE_TYPE_OPTIONS.reduce<CertificateRequestCertificateType[]>((accumulator, option) => {
    if (!certificateTypes[option.key]) {
      return accumulator;
    }

    accumulator.push(
      option.key === "otros"
        ? { type: option.value, otherType: otherCertificateType.trim() || undefined }
        : { type: option.value },
    );

    return accumulator;
  }, []);
}

function buildAttachmentsPayload(
  attachments: CertificateRequestFormState["attachments"],
  phoneNumber: string,
): CertificateRequestAttachment[] {
  const values = ATTACHMENT_OPTIONS.reduce<CertificateRequestAttachment[]>((accumulator, option) => {
    if (attachments[option.key]) {
      accumulator.push({ type: option.value });
    }

    return accumulator;
  }, []);

  if (attachments.celular) {
    values.push({
      type: "Celular",
      phoneNumber: phoneNumber.trim() || undefined,
    });
  }

  return values;
}

export function CertificateRequestForm({ mode, requestId }: CertificateRequestFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CertificateRequestFormState>(emptyForm);
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !requestId) {
      return;
    }

    const currentRequestId = requestId;
    let cancelled = false;

    async function loadRequest() {
      try {
        const request = await CertificateRequestsService.getById(currentRequestId);

        if (!cancelled) {
          setForm(mapRequestToForm(request));
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "No se pudo cargar la solicitud";
          toast.error(message);
          router.push("/solicitudes-certificados");
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
  }, [mode, requestId, router]);

  const [buscarDlg, setBuscarDlg] = useState<{
    open: boolean;
    source: "reniec" | "comunidad" | null;
    target: "client" | "partnerClient" | null;
  }>({ open: false, source: null, target: null });

  const [agregarDlg, setAgregarDlg] = useState<{
    open: boolean;
    target: "client" | "partnerClient" | null;
  }>({ open: false, target: null });

  function openBuscar(source: "reniec" | "comunidad", target: "client" | "partnerClient") {
    setBuscarDlg({ open: true, source, target });
  }

  function handleAcceptPersona(data: PersonaData) {
    if (buscarDlg.target) {
      setForm((current) => ({
        ...current,
        [buscarDlg.target!]: {
          fullName: data.fullName,
          documentNumber: data.documentNumber,
          address: data.address,
        },
      }));
    }
  }

  function openAgregar(target: "client" | "partnerClient") {
    setAgregarDlg({ open: true, target });
  }

  function handleAgregarPersona(data: PersonaData) {
    if (agregarDlg.target) {
      setForm((current) => ({
        ...current,
        [agregarDlg.target!]: {
          fullName: data.fullName,
          documentNumber: data.documentNumber,
          address: data.address,
        },
      }));
    }
  }

  function personaFields(who: "client" | "partnerClient", persona: PersonFormState) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Nombres y Apellidos</Label>
          <Input value={persona.fullName} disabled placeholder="—" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">DNI / RUC</Label>
          <Input value={persona.documentNumber} disabled placeholder="—" className="font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Domicilio</Label>
          <Input
            value={persona.address}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                [who]: { ...current[who], address: e.target.value },
              }))
            }
            placeholder="Ingrese domicilio"
          />
        </div>
      </div>
    );
  }

  function updateCheckboxGroup<T extends string>(
    section: "certificateTypes" | "attachments",
    key: T,
    checked: boolean,
  ) {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: checked,
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.client.fullName.trim() || !form.client.documentNumber.trim()) {
      toast.error("Completa el nombre y documento del cliente");
      return;
    }

    if (!form.isComunero) {
      toast.error("Selecciona si el solicitante es comunero");
      return;
    }

    if (!form.destination) {
      toast.error("Selecciona el destino de la solicitud");
      return;
    }

    const certificateTypes = buildCertificateTypesPayload(form.certificateTypes, form.otherCertificateType);

    if (certificateTypes.length === 0) {
      toast.error("Selecciona al menos un tipo de certificado");
      return;
    }

    if (form.certificateTypes.otros && !form.otherCertificateType.trim()) {
      toast.error('Completa el detalle del tipo "Otros"');
      return;
    }

    const payload: CertificateRequestPayload = {
      isComunero: form.isComunero === "si",
      destination: form.destination,
      requestDescription: form.requestDescription.trim(),
      sectorLocation: form.sectorLocation.trim(),
      client: buildPersonPayload(form.client),
      partnerClient: buildPersonPayload(form.partnerClient),
      certificateTypes,
      exposure: form.exposure.trim(),
      attachments: buildAttachmentsPayload(form.attachments, form.phoneNumber),
    };

    setSubmitting(true);

    try {
      if (mode === "edit" && requestId) {
        await CertificateRequestsService.update(Number(requestId), payload);
        toast.success("Solicitud actualizada");
      } else {
        await CertificateRequestsService.create(payload);
        toast.success("Solicitud creada");
      }

      router.push("/solicitudes-certificados");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar la solicitud";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <PageContainer title="Cargando solicitud...">
          <Card className="p-8">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Cargando solicitud...</span>
            </div>
          </Card>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageContainer
        title={mode === "edit" ? "Editar solicitud de certificado" : "Nueva solicitud de certificado"}
        description="Completa la información para registrar la solicitud."
        actions={
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/solicitudes-certificados">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          </Button>
        }
      >
        <Card className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                {sectionTitle("¿Es comunero?")}
                <RadioGroup
                  value={form.isComunero}
                  onValueChange={(value: "si" | "no") => setForm((current) => ({ ...current, isComunero: value }))}
                  className="flex gap-6"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="si" />
                    <span className="text-sm">Sí</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="no" />
                    <span className="text-sm">No</span>
                  </label>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                {sectionTitle("Destino")}
                <RadioGroup
                  value={form.destination}
                  onValueChange={(value: "Ingeniero" | "Secretaria") => setForm((current) => ({ ...current, destination: value }))}
                  className="flex gap-6"
                >
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="Ingeniero" />
                    <span className="text-sm">Ingeniero</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <RadioGroupItem value="Secretaria" />
                    <span className="text-sm">Secretaria</span>
                  </label>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="request-description" className="text-xs">Descripción de la solicitud</Label>
              <Textarea
                id="request-description"
                rows={3}
                placeholder="Ingrese una descripción..."
                value={form.requestDescription}
                onChange={(event) => setForm((current) => ({ ...current, requestDescription: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              {sectionTitle("Seleccionar tipo")}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {CERTIFICATE_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={form.certificateTypes[option.key]}
                      onCheckedChange={(checked) => updateCheckboxGroup("certificateTypes", option.key, checked === true)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>

              {form.certificateTypes.otros && (
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="other-certificate-type" className="text-xs">{'Especifique "Otros"'}</Label>
                  <Input
                    id="other-certificate-type"
                    value={form.otherCertificateType}
                    onChange={(event) => setForm((current) => ({ ...current, otherCertificateType: event.target.value }))}
                    placeholder="Describa el otro tipo de certificado"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sector-location" className="text-xs">Anexo o sector</Label>
              <Input
                id="sector-location"
                placeholder="Ingrese el anexo o sector"
                value={form.sectorLocation}
                onChange={(event) => setForm((current) => ({ ...current, sectorLocation: event.target.value }))}
              />
            </div>

            <div className="space-y-2 border-t pt-6">
              {sectionTitle("Datos del cliente")}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => openBuscar("reniec", "client")}>
                  <Search className="h-4 w-4" /> Buscar (SUNAT/RENIEC)
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => openBuscar("comunidad", "client")}>
                  <Users className="h-4 w-4" /> Buscar (Comunidad)
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => openAgregar("client")}>
                  <UserPlus className="h-4 w-4" /> Agregar cliente
                </Button>
              </div>
              {personaFields("client", form.client)}
            </div>

            <div className="space-y-2">
              {sectionTitle("Datos del conviviente")}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => openBuscar("reniec", "partnerClient")}>
                  <Search className="h-4 w-4" /> Buscar (SUNAT/RENIEC)
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => openBuscar("comunidad", "partnerClient")}>
                  <Users className="h-4 w-4" /> Buscar (Comunidad)
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => openAgregar("partnerClient")}>
                  <UserPlus className="h-4 w-4" /> Agregar conviviente
                </Button>
              </div>
              {personaFields("partnerClient", form.partnerClient)}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exposure" className="text-xs">Ante usted me presento y expongo</Label>
              <Textarea
                id="exposure"
                rows={3}
                placeholder="Ingrese texto..."
                value={form.exposure}
                onChange={(event) => setForm((current) => ({ ...current, exposure: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              {sectionTitle("Adjuntos")}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ATTACHMENT_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={form.attachments[option.key]}
                      onCheckedChange={(checked) => updateCheckboxGroup("attachments", option.key, checked === true)}
                    />
                    {option.label}
                  </label>
                ))}

                <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2 sm:col-span-2">
                  <Checkbox
                    checked={form.attachments.celular}
                    onCheckedChange={(checked) => updateCheckboxGroup("attachments", "celular", checked === true)}
                  />
                  <span className="text-sm">Celular N°</span>
                  <Input
                    className="h-8 ml-2 flex-1"
                    placeholder="999 999 999"
                    value={form.phoneNumber}
                    onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                    disabled={!form.attachments.celular}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button asChild variant="outline">
                <Link href="/solicitudes-certificados">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "edit" ? "Guardar cambios" : "Guardar"}
              </Button>
            </div>
          </form>
        </Card>

        <BuscarPersonaDialog
          open={buscarDlg.open}
          source={buscarDlg.source}
          onClose={() => setBuscarDlg((s) => ({ ...s, open: false }))}
          onAccept={handleAcceptPersona}
        />

        <AgregarClienteDialog
          open={agregarDlg.open}
          title={agregarDlg.target === "partnerClient" ? "conviviente" : "cliente"}
          onClose={() => setAgregarDlg((s) => ({ ...s, open: false }))}
          onAccept={handleAgregarPersona}
        />
      </PageContainer>
    </AppLayout>
  );
}
