export type DeletionImpactItem = {
  label: string;
  count: number;
  note?: string | null;
};

export type DeletionPreview = {
  entityLabel: string;
  itemName: string;
  canDelete: boolean;
  willDelete: DeletionImpactItem[];
  willSetNull: DeletionImpactItem[];
  willBlock: DeletionImpactItem[];
};
