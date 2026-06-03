"use client";

import { use } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AssemblyRecordForm } from "@/components/solicitudes-acta/AssemblyRecordForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useAssemblyRecordForm } from "@/hooks/use-assembly-record-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditSolicitudActaPage({ params }: PageProps) {
  const { id } = use(params);
  const {
    form,
    loading,
    submitting,
    searching,
    updateField,
    updateAdjunto,
    searchCertificate,
    handleSubmit,
    handleCancel,
  } = useAssemblyRecordForm({ mode: "edit", requestId: Number(id) });

  return (
    <AppLayout>
      <PageContainer
        title="Editar solicitud de acta de asamblea"
        description="Modifica la información de la solicitud."
        actions={
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/solicitudes-acta">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          </Button>
        }
      >
        <AssemblyRecordForm
          mode="edit"
          form={form}
          loading={loading}
          submitting={submitting}
          searching={searching}
          onFieldChange={updateField}
          onAdjuntoChange={updateAdjunto}
          onSearchCertificate={searchCertificate}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </PageContainer>
    </AppLayout>
  );
}
