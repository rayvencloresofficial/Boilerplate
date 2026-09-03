import { sql } from 'kysely';
import { db } from '../config/database.js';

export const findByName = async (name: string) => {
  return await db
    .selectFrom('roles')
    .selectAll()
    .where(sql`LOWER(name)`, '=', name.toLowerCase().trim())
    .executeTakeFirst();
};

export const findById = async (id: string) => {
  return await db
    .selectFrom('roles')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirst();
};
