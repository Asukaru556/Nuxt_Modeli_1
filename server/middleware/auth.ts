import jwt from 'jsonwebtoken';
import pool from '../utils/db';

export default defineEventHandler(async (event) => {
    const publicPaths = ['/api/auth/login', '/api/auth/register'];
    
    if (publicPaths.includes(event.path)) return;

    if (!event.path.startsWith('/api/')) return;

    const authHeader = getRequestHeader(event, 'authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) return; 

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
        const [users]: any = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);

        if (users.length > 0) {
            event.context.user = users[0];
        }
    } catch (error) {
    }
});