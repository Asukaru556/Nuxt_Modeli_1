import pool from '../../utils/db'
import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  if (!event.context.user) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, 'id');
  const baseDir = process.cwd();

  // Получаем старые пути, чтобы удалить файлы при замене
  const [rows]: any = await pool.query('SELECT image_path, model_path FROM models WHERE id = ?', [id]);
  if (rows.length === 0) throw createError({ statusCode: 404 });
  const oldModel = rows[0];

  const formData = await readMultipartFormData(event);
  if (!formData) throw createError({ statusCode: 400 });

  const updateData: any = {};
  
  for (const field of formData) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    if (field.name === 'image' && field.filename && field.data.length > 0) {
      if (oldModel.image_path) {
        try { await fs.unlink(path.join(baseDir, 'public', oldModel.image_path)) } catch (e) {}
      }
      const fileName = `img-${uniqueName}${path.extname(field.filename)}`;
      await fs.writeFile(path.join(baseDir, 'public/uploads/images', fileName), field.data);
      updateData.image_path = `/uploads/images/${fileName}`;
    } 
    else if (field.name === 'model' && field.filename && field.data.length > 0) {
      if (oldModel.model_path) {
        try { await fs.unlink(path.join(baseDir, 'public', oldModel.model_path)) } catch (e) {}
      }
      const fileName = `model-${uniqueName}${path.extname(field.filename)}`;
      await fs.writeFile(path.join(baseDir, 'public/uploads/models', fileName), field.data);
      updateData.model_path = `/uploads/models/${fileName}`;
    } 
    else if (field.name) {
      updateData[field.name] = field.data.toString();
    }
  }

  // Обновляем ВСЕ поля из твоей структуры
  await pool.query(
    `UPDATE models SET 
      title = ?, description = ?, price = ?, category_id = ?, 
      is_active = ?, is_stock = ?, button_name = ?, direct_purchase_url = ?,
      image_path = IFNULL(?, image_path), 
      model_path = IFNULL(?, model_path)
    WHERE id = ?`,
    [
      updateData.title,
      updateData.description,
      updateData.price || 0,
      updateData.category_id || null,
      updateData.is_active === 'true' || updateData.is_active === '1' ? 1 : 0,
      updateData.is_stock === 'true' || updateData.is_stock === '1' ? 1 : 0,
      updateData.button_name || null,
      updateData.direct_purchase_url || null,
      updateData.image_path || null,
      updateData.model_path || null,
      id
    ]
  );

  return { success: true };
});