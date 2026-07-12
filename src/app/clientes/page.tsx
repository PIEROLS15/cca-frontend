"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
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
import { usePaginationSync } from "@/hooks/use-pagination-sync";
import { useClients } from "@/hooks/use-clients";
import { useSession } from "@/context/session-context";
import type { Client, ClientPayload, ClientType } from "@/types/client";

function createEmptyClientForm(): ClientPayload {
  return {
    fullName: "",
    documentNumber: "",
    address: "",
    phone: "",
    clientType: "Tercero",
    licenseSequence: "",
    noDocument: false,
  };
}

type DialogMode = "create" | "edit" | "delete" | null;

function ClientesContent() {
  const { readParam, readNumParam, syncToUrl } = usePaginationSync();
  const { user } = useSession();
  const canEditLicenseSequence = user?.role?.group === 1;
  const [documentNumber, setDocumentNumber] = useState(readParam("documentNumber") ?? "");
  const [clientType, setClientType] = useState<ClientType | "">((readParam("clientType") as ClientType | "") ?? "");
  const { clients, loading, submitting, createClient, updateClient, deleteClient, page, setPage, limit, setLimit, search, setSearch, total } = useClients({
    clientType: clientType || undefined,
    documentNumber: documentNumber || undefined,
    initial: { page: readNumParam("page", 1), limit: readNumParam("limit", 5), search: readParam("search") ?? "" },
  });

  useEffect(() => {
    syncToUrl({ page: page > 1 ? page : undefined, limit: limit !== 5 ? limit : undefined, search, documentNumber, clientType });
  }, [page, limit, search, documentNumber, clientType, syncToUrl]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formValues, setFormValues] = useState<ClientPayload>(() => createEmptyClientForm());

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
      header: "DNI/RUC o código",
      render: (client) => <span className="font-mono text-xs">{client.documentNumber || client.clientCode || "-"}</span>,
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
    setFormValues(createEmptyClientForm());
  }

  function openCreateDialog() {
    setDialogMode("create");
    setSelectedClient(null);
    setFormValues(createEmptyClientForm());
  }

  function openEditDialog(client: Client) {
    setDialogMode("edit");
    setSelectedClient(client);
    setFormValues({
      fullName: client.fullName,
      documentNumber: client.documentNumber || "",
      address: client.address || "",
      phone: client.phone || "",
      clientType: client.clientType,
      licenseSequence: client.licenseSequence != null ? String(client.licenseSequence) : "",
      noDocument: client.documentNumber == null,
    });
  }

  function openDeleteDialog(client: Client) {
    setDialogMode("delete");
    setSelectedClient(client);
  }

  function updateField(field: keyof ClientPayload, value: string) {
    setFormValues((current) => ({
      ...current,
      ...(field === "clientType" && value !== "Comunero" ? { licenseSequence: "" } : {}),
      [field]: value,
    }));
  }

  function updateNoDocument(value: boolean) {
    setFormValues((current) => ({
      ...current,
      noDocument: value,
      documentNumber: value ? "" : current.documentNumber,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.fullName.trim()) {
      toast.error("Completa el nombre del cliente");
      return;
    }

    if (!formValues.noDocument && !formValues.documentNumber.trim()) {
      toast.error("Completa el DNI/RUC del cliente o marca que no tiene documento");
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
          data={clients}
          rowKey={(client) => client.id}
          loading={loading}
          loadingText="Cargando clientes..."
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

        <ClientFormDialog
          key={`${dialogMode ?? "none"}-${selectedClient?.id ?? "new"}`}
          open={dialogMode === "create" || dialogMode === "edit"}
          mode={dialogMode === "edit" ? "edit" : "create"}
          values={formValues}
          submitting={submitting}
          canEditLicenseSequence={canEditLicenseSequence}
          licenseSequenceLocked={Boolean(selectedClient?.licenseSequence != null)}
          onChange={updateField}
          onClientTypeChange={(value) => updateField("clientType", value)}
          onNoDocumentChange={updateNoDocument}
          onClose={closeDialog}
          onSubmit={handleSubmit}
        />

        <DeleteConfirmDialog
          open={dialogMode === "delete"}
          entityLabel="cliente"
          itemName={selectedClient?.fullName}
          previewEndpoint={selectedClient ? `/api/clients/${selectedClient.id}/delete-preview` : undefined}
          submitting={submitting}
          onClose={closeDialog}
          onConfirm={handleDelete}
        />
      </PageContainer>
    </AppLayout>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <ClientesContent />
    </Suspense>
  );
}
