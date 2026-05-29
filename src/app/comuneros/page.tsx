"use client";

import { useState } from "react";
import { UserSquare2 } from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { SearchFilters } from "@/components/ui/SearchFilters";
import { useClients } from "@/hooks/use-clients";
import type { Client } from "@/types/client";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ComunerosPage() {
  const { clients, loading } = useClients({
    clientType: "Comunero",
    resourceLabel: "comuneros",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredClients = clients.filter((client) =>
    client.fullName.toLowerCase().includes(normalizedSearch)
    || client.documentNumber.toLowerCase().includes(normalizedSearch)
    || (client.nro_licence || "").toLowerCase().includes(normalizedSearch)
    || (client.phone || "").toLowerCase().includes(normalizedSearch),
  );

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const currentClients = filteredClients.slice((safePage - 1) * pageSize, safePage * pageSize);

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
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserSquare2 className="h-4 w-4" />
          </div>
          <span className="font-medium text-foreground">{client.fullName}</span>
        </div>
      ),
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
          data={currentClients}
          rowKey={(client) => client.id}
          loading={loading}
          loadingText="Cargando comuneros..."
          emptyText="Sin resultados"
        />

        {!loading && (
          <PaginationControls
            page={safePage}
            pageSize={pageSize}
            totalItems={filteredClients.length}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        )}
      </PageContainer>
    </AppLayout>
  );
}
