import pool from '../../utils/db'
import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  if (!event.context.user) throw createError({ statusCode: 401 });

  const formData = await readMultipartFormData(event);
  if (!formData) throw createError({ statusCode: 400 });

  const baseDir = process.cwd();
  await fs.mkdir(path.join(baseDir, 'public/uploads/images'), { recursive: true });
  await fs.mkdir(path.join(baseDir, 'public/uploads/models'), { recursive: true });

  const modelData: any = {};
  
  for (const field of formData) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    
    if (field.name === 'image' && field.filename) {
      const fileName = `img-${uniqueName}${path.extname(field.filename)}`;
      await fs.writeFile(path.join(baseDir, 'public/uploads/images', fileName), field.data);
      modelData.image_path = `/uploads/images/${fileName}`;
    } 
    else if (field.name === 'model' && field.filename) {
      const fileName = `model-${uniqueName}${path.extname(field.filename)}`;
      await fs.writeFile(path.join(baseDir, 'public/uploads/models', fileName), field.data);
      modelData.model_path = `/uploads/models/${fileName}`;
    } 
    else if (field.name) {
      modelData[field.name] = field.data.toString();
    }
  }

  const [result]: any = await pool.query(
    `INSERT INTO models (title, description, price, category_id, is_active, is_stock, button_name, direct_purchase_url, image_path, model_path) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      modelData.title, modelData.description, modelData.price || 0, modelData.category_id || null,
      modelData.is_active === 'true' ? 1 : 0, modelData.is_stock === 'true' ? 1 : 0,
      modelData.button_name || null, modelData.direct_purchase_url || null,
      modelData.image_path || null, modelData.model_path || null
    ]
  );

  return { success: true, id: result.insertId };
});