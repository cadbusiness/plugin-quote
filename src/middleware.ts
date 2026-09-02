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
  const appPaths = [
    "/devis",
    "/sessions",
    "/wizard",
    "/produits",
    "/templates",
    "/webhooks",
    "/woocommerce",
    "/equipe",
    "/automations",
    "/stats",
  ];
  const isApp = appPaths.some((p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}.`));
  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const superAdmin = user?.app_metadata?.role === "super_admin";

  if (path === "/app" || path.startsWith("/app/")) {
    const next = request.nextUrl.clone();
    next.pathname = path === "/app" || path === "/app/" ? "/devis" : path.replace(/^\/app/, "") || "/devis";
    if (next.pathname.startsWith("/quotes")) next.pathname = next.pathname.replace("/quotes", "/devis");
    if (next.pathname.startsWith("/products")) next.pathname = next.pathname.replace("/products", "/produits");
    return NextResponse.redirect(next);
  }

  async function hasOrg() {
    if (!user) return false;
    const { data } = await supabase
      .from("memberships")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    return Boolean(data);
  }

  if ((isApp || isAdmin) && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  if (isAdmin && user && !superAdmin) {
    const home = request.nextUrl.clone();
    home.pathname = "/devis";
    return NextResponse.redirect(home);
  }

  if (isApp && user && !(await hasOrg())) {
    const dest = request.nextUrl.clone();
    dest.pathname = superAdmin ? "/admin" : "/onboarding";
    return NextResponse.redirect(dest);
  }

  if (path === "/onboarding" && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    return NextResponse.redirect(login);
  }

  if (path === "/onboarding" && user && (await hasOrg())) {
    const app = request.nextUrl.clone();
    app.pathname = "/devis";
    return NextResponse.redirect(app);
  }

  if ((path === "/login" || path === "/signup") && user) {
    const dest = request.nextUrl.searchParams.get("next");
    if (dest?.startsWith("/invite/")) {
      const invite = request.nextUrl.clone();
      invite.pathname = dest;
      invite.search = "";
      return NextResponse.redirect(invite);
    }
    const next = request.nextUrl.clone();
    if (superAdmin) next.pathname = "/admin";
    else next.pathname = (await hasOrg()) ? "/devis" : "/onboarding";
    return NextResponse.redirect(next);
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
    "/equipe",
    "/equipe/:path*",
    "/automations",
    "/automations/:path*",
    "/stats",
    "/stats/:path*",
    "/sessions",
    "/sessions/:path*",
    "/woocommerce",
    "/woocommerce/:path*",
    "/invite/:path*",
    "/login",
    "/signup",
    "/onboarding",
    "/admin",
    "/admin/:path*",
  ],
};
