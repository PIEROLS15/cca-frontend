"use client";

import { useSession } from "@/context/session-context";
import { PageLoader } from "@/components/ui/PageLoader";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default function PerfilPage() {
  const { loading, isAuthenticated, user } = useSession();

  if (loading) return <PageLoader />;

  if (!isAuthenticated || !user) return null;

  return (
    <AppLayout>
      <PageContainer title="Mi perfil" description="Administra tu información personal y credenciales de acceso.">
        <ProfileContent />
      </PageContainer>
    </AppLayout>
  );
}
