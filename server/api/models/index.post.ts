import pool from '../../utils/db'
import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({ statusCode: 401, statusMessage: 'Нужна авторизация' })
  }

  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, statusMessage: 'Данные не получены' })
  }

  const modelData: any = {}
  const baseDir = process.cwd()

  await fs.mkdir(path.join(baseDir, 'public/uploads/images'), { recursive: true })
  await fs.mkdir(path.join(baseDir, 'public/uploads/models'), { recursive: true })

  for (const field of formData) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    
    if (field.name === 'image' && field.filename && field.data.length > 0) {
      const ext = path.extname(field.filename)
      const fileName = `img-${uniqueName}${ext}`
      await fs.writeFile(path.join(baseDir, 'public/uploads/images', fileName), field.data)
      modelData.image_path = `/uploads/images/${fileName}`
    } 
    
    else if (field.name === 'model' && field.filename && field.data.length > 0) {
      const ext = path.extname(field.filename)
      const fileName = `model-${uniqueName}${ext}`
      await fs.writeFile(path.join(baseDir, 'public/uploads/models', fileName), field.data)
      modelData.model_path = `/uploads/models/${fileName}`
    }

    else if (field.name) {
      modelData[field.name] = field.data.toString()
    }
  }

  try {
    const [result]: any = await pool.query(
      `INSERT INTO models (
        title, description, price, category_id, 
        is_active, is_stock, button_name, direct_purchase_url, 
        image_path, model_path, position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        modelData.title || 'Без названия',
        modelData.description || null,
        parseFloat(modelData.price) || 0,
        modelData.category_id ? parseInt(modelData.category_id) : null,
        modelData.is_active === '1' || modelData.is_active === 'true' ? 1 : 0,
        modelData.is_stock === '1' || modelData.is_stock === 'true' ? 1 : 0,
        modelData.button_name || 'Купить',
        modelData.direct_purchase_url || null,
        modelData.image_path || null,
        modelData.model_path || null,
        parseInt(modelData.position) || 0
      ]
    )

    return { success: true, id: result.insertId }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Ошибка БД: ' + error.message })
  }
})