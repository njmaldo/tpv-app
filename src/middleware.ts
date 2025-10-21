import { defineMiddleware } from "astro/middleware";
import { getSession } from "auth-astro/server";

// --- Rutas ---
const PUBLIC_ROUTES = ["/", "/login", "/register"];
const TPV_ROUTES = ["/tpv"];
const ADMIN_PREFIX = "/admin";

export const onRequest = defineMiddleware(async ({ url, locals, redirect, request }, next) => {
  const session = await getSession(request);
  const user = session?.user;
  const isLoggedIn = Boolean(user);

  // Inicialización de locals (para usarlos en layouts o páginas)
  locals.isLoggedIn = isLoggedIn;
  locals.user = user
    ? {
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        role: (user as any).role ?? "user", // por compatibilidad
      }
    : null;
  locals.isAdmin = user?.role === "admin";
  
  const path = url.pathname;

  // --- 1. Rutas públicas ---
    if (
    PUBLIC_ROUTES.includes(path) ||
    path === "/api/send-order" ||
    path.startsWith("/actions/sendOrder") ||
    path.startsWith("/api/public") // por si querés más adelante
  ) {
    return next();
  }
  // if (PUBLIC_ROUTES.includes(path)) {
  //   return next();
  // }

  // --- 2. Rutas TPV (solo usuarios logueados) ---
  if (TPV_ROUTES.some((route) => path.startsWith(route))) {
    if (!isLoggedIn) return redirect("/login");
    return next();
  }

  // --- 3. Rutas Admin ---
  if (path.startsWith(ADMIN_PREFIX)) {
    if (!isLoggedIn) return redirect("/login");
    if (!locals.isAdmin) {
      return redirect("/tpv");
    }
  }
  if (path.startsWith("/api/auth")) return next();

  // --- 4. Catch-all: requiere login ---
  if (!isLoggedIn) {
    return redirect("/login");
  }

  return next();
});
