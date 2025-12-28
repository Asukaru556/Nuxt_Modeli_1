import pool from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  try {
    const [rows]: any = await pool.query('SELECT * FROM models WHERE id = ?', [id]);

    if (rows.length === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Model not found' });
    }

    const model = rows[0];
    return {
      ...model,
      is_active: Boolean(model.is_active),
      is_stock: Boolean(model.is_stock),
      price: model.price ? parseFloat(model.price) : 0,
      category_id: model.category_id ? parseInt(model.category_id) : null
    };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});