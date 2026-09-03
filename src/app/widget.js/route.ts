import { getAppUrl } from "@/lib/supabase/env";

export function GET() {
  const origin = getAppUrl();
  const js = `(() => {
  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  function visitorId() {
    try {
      var existing = localStorage.getItem("qb-vid");
      if (existing) return existing;
      var next = uuid();
      localStorage.setItem("qb-vid", next);
      return next;
    } catch (e) {
      return uuid();
    }
  }
  function track(org, id, vid) {
    var payload = JSON.stringify({
      orgSlug: org,
      configuratorSlug: id,
      eventType: "quotebuilder_page_view",
      visitorId: vid,
      search: window.location.search || "",
      referrer: document.referrer || "",
      landingPath: window.location.pathname + window.location.search,
    });
    var url = ${JSON.stringify(origin)} + "/api/public/track";
    try {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } catch (e) {
      fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(function () {});
    }
  }
  function iframeSrc(org, id, vid) {
    var params = new URLSearchParams(window.location.search);
    params.set("qb_vid", vid);
    if (document.referrer && !params.get("qb_ref")) params.set("qb_ref", document.referrer);
    return ${JSON.stringify(origin)} + "/embed/" + encodeURIComponent(org) + "/" + encodeURIComponent(id) + "?" + params.toString();
  }
  function mount(el) {
    var org = el.getAttribute("data-org") || el.getAttribute("data-quotebuilder-org");
    var id = el.getAttribute("data-id") || el.getAttribute("data-quotebuilder-id");
    if (!org || !id) return;
    var vid = visitorId();
    track(org, id, vid);
    var iframe = document.createElement("iframe");
    iframe.src = iframeSrc(org, id, vid);
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
