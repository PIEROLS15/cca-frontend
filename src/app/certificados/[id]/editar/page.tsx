"use client";

import { useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CertificateForm } from "@/components/certificados/CertificateForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { useCertificateForm } from "@/hooks/use-certificate-form";
import { useRouter } from "next/navigation";
import { useSession } from "@/context/session-context";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditCertificatePage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { user, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading && user?.role.group === 4) {
      router.replace("/certificados");
    }
  }, [router, sessionLoading, user]);

  if (sessionLoading || user?.role.group === 4) {
    return null;
  }

  return <EditCertificateFormPage certificateId={Number(id)} />;
}

function EditCertificateFormPage({ certificateId }: { certificateId: number }) {
  const {
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
  } = useCertificateForm({ mode: "edit", certificateId });

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
          searchingOwnerIndex={searchingOwnerIndex}
          ownerSearch={ownerSearch}
          terrainTypes={terrainTypes}
          sectors={sectors}
          onFieldChange={updateField}
          onOwnerChange={updateOwnerField}
          onAddOwner={addOwner}
          onRemoveOwner={removeOwner}
          onSearchOwnerByDocument={searchOwnerByDocument}
          onCloseOwnerSearch={closeOwnerSearch}
          onAcceptOwnerSearch={acceptOwnerSearch}
          onSearchRequest={searchRequest}
          onSubmit={handleSubmit}
        />
      </PageContainer>
    </AppLayout>
  );
}
