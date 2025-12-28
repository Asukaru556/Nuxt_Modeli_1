import pool from '../../utils/db'

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const { name } = await readBody(event);
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name is required' });

  try {
    const [existing]: any = await pool.query('SELECT id FROM categories WHERE name = ?', [name]);
    if (existing.length > 0) {
      throw createError({ statusCode: 409, statusMessage: 'Category already exists' });
    }

    const [result]: any = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
    return { id: result.insertId, name };
  } catch (error: any) {
    throw createError({ statusCode: error.statusCode || 500, statusMessage: error.message });
  }
});