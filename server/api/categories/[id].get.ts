import pool from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  try {
    const [rows]: any = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }

    return rows[0];
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message,
    });
  }
});