import { getAppUrl } from "@/lib/supabase/env";

export function GET() {
  const origin = getAppUrl();
  const js = `(() => {
  var ATTR_KEY = "qb-attr";
  var ATTR_KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","gbraid","wbraid","fbclid"];
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
  function currentPath() {
    return window.location.pathname + (window.location.search || "");
  }
  function firstTouch() {
    var current = {
      search: window.location.search || "",
      referrer: document.referrer || "",
      landingPath: currentPath(),
      title: document.title || "",
    };
    try {
      var raw = sessionStorage.getItem(ATTR_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === "object") return saved;
      }
      sessionStorage.setItem(ATTR_KEY, JSON.stringify(current));
    } catch (e) {}
    return current;
  }
  function copyAttribution(params, search) {
    if (!search) return;
    var src = new URLSearchParams(search.charAt(0) === "?" ? search.slice(1) : search);
    ATTR_KEYS.forEach(function (key) {
      var value = src.get(key);
      if (value && !params.get(key)) params.set(key, value);
    });
  }
  function send(payload) {
    var url = ${JSON.stringify(origin)} + "/api/public/track";
    try {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } catch (e) {
      fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(function () {});
    }
  }
  function track(org, id, vid, attr) {
    send(JSON.stringify({
      orgSlug: org,
      configuratorSlug: id,
      eventType: "quotebuilder_page_view",
      visitorId: vid,
      search: attr.search || window.location.search || "",
      referrer: attr.referrer || document.referrer || "",
      landingPath: currentPath(),
      title: (document.title || attr.title || "").slice(0, 160),
    }));
  }
  function iframeSrc(el, org, id, vid, attr) {
    var params = new URLSearchParams(window.location.search);
    copyAttribution(params, attr.search);
    params.set("qb_vid", vid);
    if (attr.referrer && !params.get("qb_ref")) params.set("qb_ref", attr.referrer);
    else if (document.referrer && !params.get("qb_ref")) params.set("qb_ref", document.referrer);
    if (attr.landingPath) params.set("qb_landing", attr.landingPath);
    var page = document.title || attr.title || "";
    if (page) params.set("qb_page", page.slice(0, 160));
    var cart = el.getAttribute("data-cart");
    if (cart && !params.get("qb_cart")) params.set("qb_cart", cart);
    return ${JSON.stringify(origin)} + "/embed/" + encodeURIComponent(org) + "/" + encodeURIComponent(id) + "?" + params.toString();
  }
  function mount(el) {
    var org = el.getAttribute("data-org") || el.getAttribute("data-quotebuilder-org");
    var id = el.getAttribute("data-id") || el.getAttribute("data-quotebuilder-id");
    if (!org || !id) return;
    var vid = visitorId();
    var attr = firstTouch();
    track(org, id, vid, attr);
    var iframe = document.createElement("iframe");
    iframe.src = iframeSrc(el, org, id, vid, attr);
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
