import pool from '../../utils/db'

export default defineEventHandler(async () => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories');
    return categories;
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});