import { defineMiddleware } from 'astro:middleware';
import { getSession } from 'auth-astro/server';

const PUBLIC_ROUTES = ['/login', '/register'];
const PRIVATE_ROUTES = ['/protected']

export const onRequest = defineMiddleware(
  async ({ url, locals, redirect, request }, next) => {

    const session = await getSession(request);
    const isLoggedIn = !!session;

    // TODO:
    locals.isLoggedIn = isLoggedIn;
    const user = session?.user;
    locals.user = null;
    locals.isAdmin = false;

    if (user) {
      // TODO:
      locals.user = {
        email: user.email ?? '',
        name: user.name ?? '',
      };
      locals.isAdmin = user.role === 'admin';
    }

    // TODO: Eventualmente tenemos que controlar el acceso por roles
    if (!locals.isAdmin && url.pathname.startsWith('/protected')) {
      return redirect('/');
    }
    // Redirijo si el usuario ya está autenticado e intenta acceder a login o register
    if (isLoggedIn && PUBLIC_ROUTES.includes(url.pathname)) {
      return redirect('/');
    }

    // Protección de rutas admin
    if (url.pathname.startsWith('/protected')) {
      const isAdmin = user?.role === 'admin';
      if (!isLoggedIn || !isAdmin) {
        return redirect('/');
      }
    }

    return next();
  }
);
