import pool from '../utils/db'

export default defineNitroPlugin(async () => {
  console.log('🚀 [DB] Инициализация таблиц...')
  try {
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS models (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_path VARCHAR(255),
      model_path VARCHAR(255),
      price DECIMAL(10, 2),
      direct_purchase_url VARCHAR(255),
      category_id INT,
      is_active TINYINT(1) DEFAULT 1,
      is_stock TINYINT(1) DEFAULT 0,
      position INT DEFAULT 0,
      button_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

    console.log('✅ [DB] Все таблицы готовы к работе');
  } catch (error) {
    console.error('❌ [DB] Ошибка инициализации:', error);
  }
})