"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CertificateForm } from "@/components/certificados/CertificateForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useCertificateForm } from "@/hooks/use-certificate-form";

export default function NewCertificatePage() {
  const {
    form,
    loading,
    submitting,
    searching,
    terrainTypes,
    sectors,
    updateField,
    searchRequest,
    handleSubmit,
  } = useCertificateForm({ mode: "create" });

  return (
    <AppLayout>
      <PageContainer
        title="Agregar Certificado"
        description="Ingresa el código de solicitud para autocompletar los datos de los titulares."
        actions={
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/certificados">
              <ArrowLeft className="h-4 w-4" /> Volver
            </Link>
          </Button>
        }
      >
        <CertificateForm
          mode="create"
          form={form}
          loading={loading}
          submitting={submitting}
          searching={searching}
          terrainTypes={terrainTypes}
          sectors={sectors}
          onFieldChange={updateField}
          onSearchRequest={searchRequest}
          onSubmit={handleSubmit}
        />
      </PageContainer>
    </AppLayout>
  );
}
