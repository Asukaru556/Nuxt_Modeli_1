export default defineEventHandler(async (event) => {
    const user = event.context.user;

    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }

    return {
        id: user.id,
        email: user.email,
        created_at: user.created_at
    };
});