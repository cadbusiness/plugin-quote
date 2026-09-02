import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const appPaths = ["/devis", "/wizard", "/produits", "/templates", "/webhooks"];
  const isApp = appPaths.some((p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}.`));

  if (path === "/app" || path.startsWith("/app/")) {
    const next = request.nextUrl.clone();
    next.pathname = path === "/app" || path === "/app/" ? "/devis" : path.replace(/^\/app/, "") || "/devis";
    if (next.pathname.startsWith("/quotes")) next.pathname = next.pathname.replace("/quotes", "/devis");
    if (next.pathname.startsWith("/products")) next.pathname = next.pathname.replace("/products", "/produits");
    return NextResponse.redirect(next);
  }

  if (isApp && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  if ((path === "/login" || path === "/signup") && user) {
    const app = request.nextUrl.clone();
    app.pathname = "/devis";
    return NextResponse.redirect(app);
  }

  return response;
}

export const config = {
  matcher: [
    "/app",
    "/app/:path*",
    "/devis",
    "/devis/:path*",
    "/devis.csv",
    "/wizard",
    "/wizard/:path*",
    "/produits",
    "/produits/:path*",
    "/templates",
    "/templates/:path*",
    "/webhooks",
    "/webhooks/:path*",
    "/login",
    "/signup",
  ],
};
