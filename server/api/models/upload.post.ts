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
    
    if (field.name === 'image' && field.filename) {
      const ext = path.extname(field.filename)
      const fileName = `${uniqueName}${ext}`
      await fs.writeFile(path.join(baseDir, 'public/uploads/images', fileName), field.data)
      modelData.image_path = `/uploads/images/${fileName}`
    } 
    
    if (field.name === 'model' && field.filename) {
      const ext = path.extname(field.filename)
      const fileName = `${uniqueName}${ext}`
      await fs.writeFile(path.join(baseDir, 'public/uploads/models', fileName), field.data)
      modelData.model_path = `/uploads/models/${fileName}`
    }

    if (field.name && !field.filename) {
      modelData[field.name] = field.data.toString()
    }
  }

  const [result]: any = await pool.query(
    `INSERT INTO models (title, description, image_path, model_path, category_id, price) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [modelData.title, modelData.description, modelData.image_path, modelData.model_path, modelData.category_id, modelData.price]
  )

  return { success: true, id: result.insertId }
})