import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';

// --- Rutas ---
const PUBLIC_ROUTES = ['/', '/login', '/register']; // libres siempre
const TPV_ROUTES = ['/tpv']; // requiere login
const ADMIN_PREFIX = '/admin'; // requiere admin

export const onRequest = defineMiddleware(
  async ({ url, locals, redirect, request }, next) => {
    const session = await getSession(request);
    const isLoggedIn = !!session;
    const user = session?.user;

    // Inicialización de locals
    locals.isLoggedIn = isLoggedIn;
    locals.user = user
      ? { email: user.email ?? '', name: user.name ?? '', role: (user as any).role ?? 'user' }
      : null;
    locals.isAdmin = user?.role === 'admin';

    const path = url.pathname;

    // --- Rutas públicas ---
    if (PUBLIC_ROUTES.includes(path)) {
      return next();
    }

    // --- Rutas TPV (requiere login) ---
    if (TPV_ROUTES.some(route => path.startsWith(route))) {
      if (!isLoggedIn) return redirect('/login');
      return next();
    }

    // --- Rutas de administración (requiere admin) ---
    if (path.startsWith(ADMIN_PREFIX)) {
      if (!isLoggedIn) return redirect('/login'); // primero login
      if (!locals.isAdmin) return redirect('/');  // si no es admin
      return next();
    }

    // --- Para cualquier otra ruta no declarada: requiere login ---
    if (!isLoggedIn) {
      return redirect('/login');
    }

    return next();
  }
);
