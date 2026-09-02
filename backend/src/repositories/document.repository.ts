import { sql } from 'kysely';
import { db } from '../config/database.js';
import type {
  DocumentItem,
  DocumentFilter,
  CreateDocumentDto,
  UpdateDocumentDto,
} from '../types/document.js';

export const findAll = async (filter?: DocumentFilter): Promise<DocumentItem[]> => {
  let query = db
    .selectFrom('documents')
    .leftJoin('users', 'users.id', 'documents.created_by')
    .select([
      'documents.id',
      'documents.title',
      'documents.content',
      'documents.category',
      'documents.status',
      'documents.created_by',
      'documents.created_at',
      'documents.updated_at',
      'users.email as creator_email',
      sql<string | null>`NULLIF(TRIM(CONCAT(users.first_name, ' ', users.last_name)), '')`.as(
        'creator_name'
      ),
    ]);

  if (filter?.category) {
    query = query.where('documents.category', '=', filter.category.trim().toLowerCase());
  }

  if (filter?.status) {
    query = query.where('documents.status', '=', filter.status.trim().toLowerCase());
  }

  if (filter?.search) {
    const term = `%${filter.search.trim()}%`;
    query = query.where((eb) =>
      eb.or([
        eb('documents.title', 'ilike', term),
        eb('documents.content', 'ilike', term),
      ])
    );
  }

  const rows = await query.orderBy('documents.created_at', 'desc').execute();
  return rows as DocumentItem[];
};

export const findById = async (id: string): Promise<DocumentItem | null> => {
  const row = await db
    .selectFrom('documents')
    .leftJoin('users', 'users.id', 'documents.created_by')
    .select([
      'documents.id',
      'documents.title',
      'documents.content',
      'documents.category',
      'documents.status',
      'documents.created_by',
      'documents.created_at',
      'documents.updated_at',
      'users.email as creator_email',
      sql<string | null>`NULLIF(TRIM(CONCAT(users.first_name, ' ', users.last_name)), '')`.as(
        'creator_name'
      ),
    ])
    .where('documents.id', '=', id)
    .executeTakeFirst();

  return (row as DocumentItem) || null;
};

export const create = async (
  data: CreateDocumentDto & { created_by?: string | null }
): Promise<DocumentItem> => {
  const created = await db
    .insertInto('documents')
    .values({
      title: data.title.trim(),
      content: data.content ?? null,
      category: data.category?.trim().toLowerCase() || 'general',
      status: data.status?.trim().toLowerCase() || 'published',
      created_by: data.created_by ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const fullRecord = await findById(created.id);
  return fullRecord!;
};

export const update = async (
  id: string,
  data: UpdateDocumentDto
): Promise<DocumentItem | null> => {
  const updateValues: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) {
    updateValues['title'] = data.title.trim();
  }
  if (data.content !== undefined) {
    updateValues['content'] = data.content;
  }
  if (data.category !== undefined) {
    updateValues['category'] = data.category.trim().toLowerCase();
  }
  if (data.status !== undefined) {
    updateValues['status'] = data.status.trim().toLowerCase();
  }

  const result = await db
    .updateTable('documents')
    .set(updateValues)
    .where('id', '=', id)
    .returning('id')
    .executeTakeFirst();

  if (!result) return null;
  return await findById(id);
};

export const deleteById = async (id: string): Promise<boolean> => {
  const result = await db
    .deleteFrom('documents')
    .where('id', '=', id)
    .executeTakeFirst();

  return Number(result.numDeletedRows) > 0;
};
