import pool from '../../utils/db'

export default defineEventHandler(async (event) => {
  // Получаем ID из параметров пути (например, /api/categories/5)
  const id = getRouterParam(event, 'id');

  try {
    // Выполняем запрос к БД
    const [rows]: any = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);

    // Если категория не найдена, возвращаем 404
    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Category not found',
      });
    }

    // Возвращаем объект категории
    return rows[0];
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message,
    });
  }
});