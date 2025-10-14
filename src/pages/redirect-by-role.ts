
import type { APIRoute } from "astro";
import { getSession } from "auth-astro/server";

export const GET: APIRoute = async ({ request, redirect }) => {
  const session = await getSession(request);

  if (!session) {
    return redirect("/login");
  }

  const role = session.user?.role ?? "user";

  switch (role) {
    case "admin":
      return redirect("/admin/products");
    case "user":
      return redirect("/tpv");
    default:
      return redirect("/");
  }
};





