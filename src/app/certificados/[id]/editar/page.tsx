"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CertificateForm } from "@/components/certificados/CertificateForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useCertificateForm } from "@/hooks/use-certificate-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCertificatePage({ params }: PageProps) {
  const { id } = use(params);
  const {
    form,
    loading,
    submitting,
    searching,
    terrainTypes,
    sectors,
    updateField,
    updateOwnerField,
    addOwner,
    removeOwner,
    searchRequest,
    handleSubmit,
  } = useCertificateForm({ mode: "edit", certificateId: Number(id) });

  return (
    <AppLayout>
      <PageContainer
        title="Editar Certificado"
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
          mode="edit"
          form={form}
          loading={loading}
          submitting={submitting}
          searching={searching}
          terrainTypes={terrainTypes}
          sectors={sectors}
          onFieldChange={updateField}
          onOwnerChange={updateOwnerField}
          onAddOwner={addOwner}
          onRemoveOwner={removeOwner}
          onSearchRequest={searchRequest}
          onSubmit={handleSubmit}
        />
      </PageContainer>
    </AppLayout>
  );
}
