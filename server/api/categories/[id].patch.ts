import pool from '../../utils/db'

export default defineEventHandler(async (event) => {
  if (!event.context.user) throw createError({ statusCode: 401 });
  
  const id = getRouterParam(event, 'id');
  const { name } = await readBody(event);

  await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return { message: 'Updated successfully' };
});