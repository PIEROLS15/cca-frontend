"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AssemblyRecordForm } from "@/components/solicitudes-acta/AssemblyRecordForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useAssemblyRecordForm } from "@/hooks/use-assembly-record-form";

export default function NewSolicitudActaPage() {
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
  } = useAssemblyRecordForm({ mode: "create" });

  return (
    <AppLayout>
      <PageContainer
        title="Nueva solicitud de acta de asamblea"
        description="Completa la información para registrar la adjudicación en acta."
        actions={
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/solicitudes-acta">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          </Button>
        }
      >
        <AssemblyRecordForm
          mode="create"
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
