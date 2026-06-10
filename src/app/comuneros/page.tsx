"use client";

import { Suspense, useEffect } from "react";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import { useClients } from "@/hooks/use-clients";
import type { Client } from "@/types/client";

function ComunerosContent() {
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const { clients, loading, page, setPage, limit, setLimit, search, setSearch, total } = useClients({
    clientType: "Comunero",
    resourceLabel: "comuneros",
    initial: { page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "" },
  });

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search });
  }, [page, limit, search, syncToUrl]);

  const columns: DataTableColumn<Client>[] = [
    {
      key: "nro_licence",
      header: "N° Carnet",
      render: (client) => (
        <span className="font-mono font-medium">{client.nro_licence || "-"}</span>
      ),
    },
    {
      key: "fullName",
      header: "Nombres",
      render: (client) => <span className="font-medium text-foreground">{client.fullName}</span>,
    },
    {
      key: "documentNumber",
      header: "Documento",
      render: (client) => <span className="font-mono text-xs">{client.documentNumber}</span>,
    },
  ];

  return (
    <AppLayout>
      <PageContainer
        title="Comuneros Empadronados"
        description="Base de datos oficial de comuneros con padrón vigente."
      >
        <SearchFilters
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onClear={() => {
            setSearch("");
            setPage(1);
          }}
          placeholder="Buscar por carnet, documento, teléfono o nombre..."
        />

        <DataTable
          columns={columns}
          data={clients}
          rowKey={(client) => client.id}
          loading={loading}
          loadingText="Cargando comuneros..."
          emptyText="Sin resultados"
        />

        {!loading && total > 0 && (
          <PaginationControls
            page={page}
            limit={limit}
            totalItems={total}
            onPageChange={setPage}
            onLimitChange={(value) => {
              setLimit(value);
              setPage(1);
            }}
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}

export default function ComunerosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <ComunerosContent />
    </Suspense>
  );
}
