"use client";

import { useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { ClientFilters } from "@/components/clientes/ClientFilters";
import { ClientFormDialog } from "@/components/clientes/ClientFormDialog";
import { ClientTypeBadge } from "@/components/clientes/ClientTypeBadge";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageContainer } from "@/components/layout/PageContainer";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/use-clients";
import type { Client, ClientPayload, ClientType } from "@/types/client";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const EMPTY_FORM: ClientPayload = {
  fullName: "",
  documentNumber: "",
  address: "",
  phone: "",
  clientType: "Comunero",
};

type DialogMode = "create" | "edit" | "delete" | null;

export default function ClientesPage() {
  const { clients, loading, submitting, createClient, updateClient, deleteClient } = useClients();
  const [search, setSearch] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [clientType, setClientType] = useState<ClientType | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formValues, setFormValues] = useState<ClientPayload>(EMPTY_FORM);

  const normalizedSearch = search.trim().toLowerCase();
  const normalizedDocument = documentNumber.trim().toLowerCase();

  const filteredClients = clients.filter((client) => {
    if (normalizedSearch && !client.fullName.toLowerCase().includes(normalizedSearch)) {
      return false;
    }

    if (normalizedDocument && !client.documentNumber.toLowerCase().includes(normalizedDocument)) {
      return false;
    }

    if (clientType && client.clientType !== clientType) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const currentClients = filteredClients.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns: DataTableColumn<Client>[] = [
    {
      key: "fullName",
      header: "Nombre",
      render: (client) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <span className="font-medium text-foreground">{client.fullName}</span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Teléfono",
      render: (client) => (
        <span className="font-mono text-xs text-muted-foreground">{client.phone || "-"}</span>
      ),
    },
    {
      key: "clientType",
      header: "Tipo",
      render: (client) => <ClientTypeBadge type={client.clientType} />,
    },
    {
      key: "documentNumber",
      header: "DNI/RUC",
      render: (client) => <span className="font-mono text-xs">{client.documentNumber}</span>,
    },
    {
      key: "address",
      header: "Dirección",
      render: (client) => <span className="text-xs">{client.address || "-"}</span>,
    },
    {
      key: "actions",
      header: "Acciones",
      className: "w-32 text-right",
      render: (client) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-warning hover:text-warning"
            onClick={() => openEditDialog(client)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar {client.fullName}</span>
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => openDeleteDialog(client)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar {client.fullName}</span>
          </Button>
        </div>
      ),
    },
  ];

  function closeDialog() {
    setDialogMode(null);
    setSelectedClient(null);
    setFormValues(EMPTY_FORM);
  }

  function openCreateDialog() {
    setDialogMode("create");
    setSelectedClient(null);
    setFormValues(EMPTY_FORM);
  }

  function openEditDialog(client: Client) {
    setDialogMode("edit");
    setSelectedClient(client);
    setFormValues({
      fullName: client.fullName,
      documentNumber: client.documentNumber,
      address: client.address || "",
      phone: client.phone || "",
      clientType: client.clientType,
    });
  }

  function openDeleteDialog(client: Client) {
    setDialogMode("delete");
    setSelectedClient(client);
  }

  function updateField(field: keyof ClientPayload, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.fullName.trim() || !formValues.documentNumber.trim()) {
      toast.error("Completa nombre y documento del cliente");
      return;
    }

    const success = dialogMode === "edit" && selectedClient
      ? await updateClient(selectedClient.id, formValues)
      : await createClient(formValues);

    if (success) {
      closeDialog();
    }
  }

  async function handleDelete() {
    if (!selectedClient) {
      return;
    }

    const success = await deleteClient(selectedClient);

    if (success) {
      closeDialog();
    }
  }

  return (
    <AppLayout>
      <PageContainer
        title="Clientes"
        description="Comuneros y terceros registrados en el sistema."
        actions={
          <Button className="gap-1.5" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Agregar cliente
          </Button>
        }
      >
        <ClientFilters
          search={search}
          documentNumber={documentNumber}
          clientType={clientType}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onDocumentNumberChange={(value) => {
            setDocumentNumber(value);
            setPage(1);
          }}
          onClientTypeChange={(value) => {
            setClientType(value);
            setPage(1);
          }}
          onClear={() => {
            setSearch("");
            setDocumentNumber("");
            setClientType("");
            setPage(1);
          }}
        />

        <DataTable
          columns={columns}
          data={currentClients}
          rowKey={(client) => client.id}
          loading={loading}
          loadingText="Cargando clientes..."
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

        <ClientFormDialog
          open={dialogMode === "create" || dialogMode === "edit"}
          mode={dialogMode === "edit" ? "edit" : "create"}
          values={formValues}
          submitting={submitting}
          onChange={updateField}
          onClientTypeChange={(value) => updateField("clientType", value)}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />

        <DeleteConfirmDialog
          open={dialogMode === "delete"}
          entityLabel="cliente"
          itemName={selectedClient?.fullName}
          submitting={submitting}
          onClose={closeDialog}
          onConfirm={handleDelete}
        />
      </PageContainer>
    </AppLayout>
  );
}
