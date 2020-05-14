export interface CloudinaryDeleteResponse {
  deleted: { [name: string]: string };
  deleted_counts: {
    [name: string]: { original: number; derived: number };
  };
  partial: boolean;
}
