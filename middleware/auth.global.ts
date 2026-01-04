export default defineNuxtRouteMiddleware((to) => {
    const token = useCookie('auth_token');

    if (to.path.startsWith('/admin') && !token.value) {
        return navigateTo('/auth/login');
    }

    if (to.path === '/auth/login' && token.value) {
        return navigateTo('/admin/models');
    }
});