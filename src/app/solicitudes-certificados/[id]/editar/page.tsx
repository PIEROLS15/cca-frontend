"use client";

import { useParams } from "next/navigation";

import { CertificateRequestForm } from "@/components/solicitudes-certificados/CertificateRequestForm";

export default function EditCertificateRequestPage() {
  const params = useParams<{ id: string }>();

  return <CertificateRequestForm mode="edit" requestId={params.id} />;
}
