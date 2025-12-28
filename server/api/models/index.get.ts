import pool from '../../utils/db'

export default defineEventHandler(async () => {
  const [models]: any = await pool.query('SELECT * FROM models ORDER BY position ASC, id DESC');
  
  return models.map((m: any) => ({
    ...m,
    is_active: Boolean(m.is_active),
    is_stock: Boolean(m.is_stock),
    price: m.price ? parseFloat(m.price) : null
  }));
});