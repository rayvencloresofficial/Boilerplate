export interface DocumentItem {
  id: string;
  title: string;
  content: string | null;
  category: string;
  status: string;
  created_by: string | null;
  creator_name?: string | null;
  creator_email?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDocumentDto {
  title: string;
  content?: string | null;
  category?: string;
  status?: string;
}

export interface UpdateDocumentDto {
  title?: string;
  content?: string | null;
  category?: string;
  status?: string;
}

export interface DocumentFilter {
  category?: string;
  status?: string;
  search?: string;
}
