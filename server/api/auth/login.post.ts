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
        { expiresIn: '24h' } 
    );

    setCookie(event, 'auth_token', token, {
        httpOnly: false,
        maxAge: 60 * 60 * 24,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    setCookie(event, 'user_email', user.email, {
        maxAge: 60 * 60 * 24,
        path: '/'
    });

    return { token, userId: user.id, email: user.email };
});