import jwt from 'jsonwebtoken';
import pool from '../utils/db';

export default defineEventHandler(async (event) => {
    const path = event.path.split('?')[0];

    const publicPaths = ['/api/auth/login', '/api/auth/register'];
    const isPublicGet = event.method === 'GET' && 
        (path.startsWith('/api/models') || path.startsWith('/api/categories'));
    
    if (publicPaths.includes(path) || isPublicGet) return;
    if (!path.startsWith('/api/')) return;

    const cookies = parseCookies(event);
    const authHeader = getRequestHeader(event, 'authorization');
    
    const token = cookies.auth_token || authHeader?.replace('Bearer ', '');

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Token required' });
    } 

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const [users]: any = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

        if (users.length === 0) {
            throw createError({ statusCode: 401, statusMessage: 'User not found' });
        }
        
        event.context.user = users[0];
    } catch (error) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid token' });
    }
});