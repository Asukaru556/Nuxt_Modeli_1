import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../utils/db';

export default defineEventHandler(async (event) => {
    const { email, password } = await readBody(event);

    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );

    return { token, userId: user.id, email: user.email };
});