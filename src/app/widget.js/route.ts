import { getAppUrl } from "@/lib/supabase/env";

export function GET() {
  const origin = getAppUrl();
  const js = `(() => {
  function mount(el) {
    var org = el.getAttribute("data-org") || el.getAttribute("data-quotebuilder-org");
    var id = el.getAttribute("data-id") || el.getAttribute("data-quotebuilder-id");
    if (!org || !id) return;
    var iframe = document.createElement("iframe");
    iframe.src = ${JSON.stringify(origin)} + "/embed/" + encodeURIComponent(org) + "/" + encodeURIComponent(id);
    iframe.style.width = "100%";
    iframe.style.border = "0";
    iframe.style.minHeight = el.getAttribute("data-height") || "720px";
    iframe.setAttribute("title", "QuoteBuilder");
    iframe.setAttribute("loading", "lazy");
    el.innerHTML = "";
    el.appendChild(iframe);
  }
  function init() {
    document.querySelectorAll("[data-quotebuilder], .quotebuilder-embed").forEach(mount);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();`;
  return new Response(js, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
