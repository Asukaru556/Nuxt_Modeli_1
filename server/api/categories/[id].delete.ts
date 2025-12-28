import pool from '../../utils/db'

export default defineEventHandler(async (event) => {
  if (!event.context.user) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, 'id');

  const [models]: any = await pool.query('SELECT id FROM models WHERE category_id = ?', [id]);
  if (models.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Cannot delete: category has models' });
  }

  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  return { message: 'Deleted successfully' };
});