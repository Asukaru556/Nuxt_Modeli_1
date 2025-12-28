import pool from '../../utils/db'
import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  if (!event.context.user) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, 'id');
  const baseDir = process.cwd();

  const [models]: any = await pool.query('SELECT image_path, model_path FROM models WHERE id = ?', [id]);
  if (models.length === 0) throw createError({ statusCode: 404 });

  const model = models[0];

  try {
    if (model.image_path) await fs.unlink(path.join(baseDir, 'public', model.image_path));
    if (model.model_path) await fs.unlink(path.join(baseDir, 'public', model.model_path));
  } catch (e) {
    console.error('File delete error:', e);
  }

  await pool.query('DELETE FROM models WHERE id = ?', [id]);
  return { message: 'Deleted' };
});