import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../utils/db';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);

    const [existingUser]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        throw createError({ statusCode: 400, statusMessage: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result]: any = await pool.query(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
    );

    const token = jwt.sign(
        { id: result.insertId },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );

    return { token, userId: result.insertId, email };
});