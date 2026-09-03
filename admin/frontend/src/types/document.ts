export interface DocumentItem {
  id: string;
  title: string;
  content: string | null;
  category: string;
  status: 'draft' | 'published' | 'archived';
  created_by: string | null;
  creator_name?: string | null;
  creator_email?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentDto {
  title: string;
  content?: string | null;
  category?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateDocumentDto {
  title?: string;
  content?: string | null;
  category?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface DocumentFilter {
  category?: string;
  status?: string;
  search?: string;
}
