import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';

const PUBLIC_ROUTES = ['/login', '/register', '/redirect-by-role'];
const ADMIN_ROUTES = ['/protected','admin/products']; 

export const onRequest = defineMiddleware(
  async ({ url, locals, redirect, request }, next) => {

    const session = await getSession(request);
    const isLoggedIn = !!session;
    const user = session?.user;

    // Inicialización de locals
    locals.isLoggedIn = isLoggedIn;
    locals.user = user ? { email: user.email ?? '', name: user.name ?? '' } : null;
    locals.isAdmin = user?.role === 'admin';

    // --- Lógica de Protección de Rutas ---
    // 1. Redirigir a usuarios logueados que intentan acceder a rutas públicas
    if (isLoggedIn && PUBLIC_ROUTES.includes(url.pathname)) {
      return redirect('/');
    }
    
    // 2. Proteger rutas que requieren rol de admin
    const requiresAdmin = ADMIN_ROUTES.some(route => url.pathname.startsWith(route));
    if (requiresAdmin && (!isLoggedIn || !locals.isAdmin)) {
      return redirect('/'); // Redirige si la ruta es de admin pero el usuario no lo es o no está logueado
    }

    // Si todo está en orden, continúa
    return next();
  }
);