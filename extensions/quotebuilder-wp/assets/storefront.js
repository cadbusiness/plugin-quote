(function () {
  var cfg = window.QuoteBuilderStore || {};

  function post(quoteAction, extra) {
    var body = new FormData();
    body.append("action", "quotebuilder_quote");
    body.append("nonce", cfg.nonce);
    body.append("quote_action", quoteAction);
    Object.keys(extra || {}).forEach(function (key) {
      body.append(key, extra[key]);
    });
    return fetch(cfg.ajax, { method: "POST", body: body, credentials: "same-origin" }).then(function (res) {
      return res.json();
    });
  }

  var pendingRemove = {};

  function paint(data) {
    var fab = document.querySelector(".qb-fab");
    if (fab) {
      fab.hidden = !data.count && !cfg.showFloatingWhenEmpty;
      var badge = fab.querySelector("span");
      if (badge) badge.textContent = data.count;
      fab.setAttribute("data-count", data.count);
    }
    var body = document.querySelector("[data-qb-drawer-body]");
    if (body && typeof data.drawer === "string") {
      body.innerHTML = data.drawer;
      Object.keys(pendingRemove).forEach(function (key) {
        var row = drawerRow(key);
        if (row) markPending(row);
      });
    }
    document.dispatchEvent(new CustomEvent("quotebuilder:list", { detail: data || {} }));
  }

  function rowKey(row) {
    return row.getAttribute("data-id") + "|" + (row.getAttribute("data-variation") || "");
  }

  function drawerRow(key) {
    var found = null;
    document.querySelectorAll(".qb-drawer .qb-line").forEach(function (row) {
      if (rowKey(row) === key) found = row;
    });
    return found;
  }

  function markPending(row) {
    row.classList.add("is-pending");
    var undo = row.querySelector(".qb-undo");
    if (undo) undo.hidden = false;
  }

  function openDrawer() {
    var drawer = document.querySelector(".qb-drawer");
    var backdrop = document.querySelector(".qb-backdrop");
    if (drawer) drawer.hidden = false;
    if (backdrop) backdrop.hidden = false;
    document.documentElement.classList.add("qb-drawer-open");
  }

  function closeDrawer() {
    var drawer = document.querySelector(".qb-drawer");
    var backdrop = document.querySelector(".qb-backdrop");
    if (drawer) drawer.hidden = true;
    if (backdrop) backdrop.hidden = true;
    document.documentElement.classList.remove("qb-drawer-open");
  }

  function scheduleRemove(row) {
    var key = rowKey(row);
    markPending(row);
    clearTimeout(pendingRemove[key]);
    pendingRemove[key] = setTimeout(function () {
      delete pendingRemove[key];
      post("remove", {
        product_id: row.getAttribute("data-id"),
        variation_id: row.getAttribute("data-variation") || "",
      }).then(function (json) {
        if (json.success) paint(json.data);
      });
    }, 5000);
  }

  function cancelRemove(row) {
    var key = rowKey(row);
    clearTimeout(pendingRemove[key]);
    delete pendingRemove[key];
    row.classList.remove("is-pending");
    var undo = row.querySelector(".qb-undo");
    if (undo) undo.hidden = true;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function toast(message, withLink) {
    var el = document.querySelector(".qb-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "qb-toast";
      document.body.appendChild(el);
    }
    el.innerHTML = escapeHtml(message);
    if (withLink && cfg.quoteUrl) {
      el.innerHTML += ' <a href="' + cfg.quoteUrl + '">' + escapeHtml(cfg.browseListLabel || "Consulter la liste") + "</a>";
    }
    el.hidden = false;
    clearTimeout(el._hide);
    el._hide = setTimeout(function () {
      el.hidden = true;
    }, 4200);
  }

  function quantity(button) {
    var form = button.closest("form.cart");
    if (!form) return 1;
    var field = form.querySelector("input.qty, input[name=quantity]");
    return field ? field.value : 1;
  }

  function variationId(button) {
    var form = button.closest("form.cart");
    if (!form) return 0;
    var field = form.querySelector("input[name=variation_id], select[name=variation_id]");
    return field ? field.value : 0;
  }

  document.addEventListener("click", function (event) {
    var add = event.target.closest(".qb-atq[data-product]");
    if (add) {
      event.preventDefault();
      post("add", {
        product_id: add.getAttribute("data-product"),
        variation_id: variationId(add),
        qty: quantity(add),
      }).then(function (json) {
        if (!json.success) return;
        paint(json.data);
        document.dispatchEvent(new CustomEvent("quotebuilder:added", { detail: json.data || {} }));
        if (json.data.already) {
          toast(cfg.alreadyInListLabel || "Ce produit figure déjà dans votre liste de devis.", true);
          return;
        }
        if (document.querySelector(".qb-quote-page")) {
          window.location.reload();
          return;
        }
        if (cfg.afterAdd === "list" && json.data.url) {
          window.location.href = json.data.url;
          return;
        }
        if (cfg.afterAdd === "notice" || cfg.afterAdd === "stay") {
          toast(cfg.addedLabel || "Produit ajouté à la liste", cfg.afterAdd === "notice");
          return;
        }
        openDrawer();
      });
    }

    if (event.target.closest(".qb-from-cart")) {
      event.preventDefault();
      post("from_cart").then(function (json) {
        if (json.success && json.data.url) window.location.href = json.data.url;
      });
    }

    if (event.target.closest(".qb-fab")) {
      var drawer = document.querySelector(".qb-drawer");
      if (drawer && drawer.hidden) openDrawer();
      else closeDrawer();
    }

    if (event.target.closest(".qb-drawer-close") || event.target.closest(".qb-backdrop")) {
      closeDrawer();
    }

    var undo = event.target.closest(".qb-undo-cancel");
    if (undo) {
      event.preventDefault();
      var undoRow = undo.closest(".qb-line");
      if (undoRow) cancelRemove(undoRow);
    }

    var plus = event.target.closest(".qb-qty-plus, .qb-qty-minus");
    if (plus) {
      event.preventDefault();
      var stepRow = plus.closest(".qb-line");
      if (!stepRow || stepRow.classList.contains("is-pending")) return;
      var current = parseInt(stepRow.getAttribute("data-qty") || "1", 10) || 1;
      if (plus.classList.contains("qb-qty-minus") && current <= 1) {
        scheduleRemove(stepRow);
        return;
      }
      var nextQty = plus.classList.contains("qb-qty-plus") ? current + 1 : current - 1;
      post("update", {
        product_id: stepRow.getAttribute("data-id"),
        variation_id: stepRow.getAttribute("data-variation") || "",
        qty: nextQty,
      }).then(function (json) {
        if (json.success) paint(json.data);
      });
    }

    var remove = event.target.closest(".qb-remove");
    if (remove) {
      var row = remove.closest("li");
      if (remove.closest(".qb-drawer")) {
        if (row) scheduleRemove(row);
        return;
      }
      post("remove", {
        product_id: row.getAttribute("data-id"),
        variation_id: row.getAttribute("data-variation") || "",
      }).then(function (json) {
        if (json.success) window.location.reload();
      });
    }

    if (event.target.closest(".qb-clear-list")) {
      event.preventDefault();
      post("clear").then(function (json) {
        if (json.success) window.location.reload();
      });
    }

    if (event.target.closest(".qb-update-list")) {
      event.preventDefault();
      var qtys = [];
      document.querySelectorAll(".qb-quote-items li").forEach(function (item) {
        var qty = item.querySelector(".qb-qty");
        qtys.push({
          id: item.getAttribute("data-id"),
          variation_id: item.getAttribute("data-variation") || "",
          qty: qty ? qty.value : 1,
        });
      });
      post("update_all", { qtys: JSON.stringify(qtys) }).then(function (json) {
        if (json.success) window.location.reload();
      });
    }
  });

  document.addEventListener("change", function (event) {
    if (!event.target.classList.contains("qb-qty")) return;
    var row = event.target.closest("li");
    if (!row) return;
    post("update", {
      product_id: row.getAttribute("data-id"),
      variation_id: row.getAttribute("data-variation") || "",
      qty: event.target.value,
    });
  });

  function visitorId() {
    try {
      var existing = localStorage.getItem("qb-vid");
      if (existing) return existing;
      var next = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : String(Date.now());
      localStorage.setItem("qb-vid", next);
      return next;
    } catch (e) {
      return String(Date.now());
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
      title: cfg.pageTitle || document.title || "",
    };
    try {
      var raw = sessionStorage.getItem("qb-attr");
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === "object") return saved;
      }
      sessionStorage.setItem("qb-attr", JSON.stringify(current));
    } catch (e) {}
    return current;
  }

  function trackVisit() {
    if (!cfg.origin || !cfg.org || !cfg.funnel || !cfg.pageKind) return;
    var attr = firstTouch();
    var payload = JSON.stringify({
      orgSlug: cfg.org,
      configuratorSlug: cfg.funnel,
      eventType: "quotebuilder_page_view",
      visitorId: visitorId(),
      search: attr.search || window.location.search || "",
      referrer: document.referrer || attr.referrer || "",
      landingPath: currentPath(),
      title: (cfg.pageTitle || document.title || attr.title || "").slice(0, 160),
    });
    var url = String(cfg.origin).replace(/\/$/, "") + "/api/public/track";
    try {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } catch (e) {
      fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: true }).catch(function () {});
    }
  }

  function trackAnonymous(name, params) {
    var detail = {};
    var payload = { event: name };
    Object.keys(params || {}).forEach(function (key) {
      if (key === "email" || key === "phone" || key === "name" || key === "sha256_email" || key === "hashedEmail") return;
      var value = params[key];
      if (typeof value === "string" && value.indexOf("@") !== -1) return;
      detail[key] = value;
      payload[key] = value;
    });
    document.dispatchEvent(new CustomEvent(name.replace("quotebuilder_", "quotebuilder:"), {
      detail: payload.step_name ? Object.assign({ name: payload.step_name }, detail) : detail,
    }));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }

  function adsConsent() {
    try {
      if (window.qbAdsConsent === true) return true;
      if (window.Cookiebot && window.Cookiebot.consent && window.Cookiebot.consent.marketing === true) return true;
      if (/cookieyes-consent=[^;]*advertisement:yes/.test(document.cookie || "")) return true;
      var layer = window.dataLayer || [];
      for (var i = layer.length - 1; i >= 0; i--) {
        var item = layer[i];
        if (item && item[0] === "consent" && item[1] === "update" && item[2] && item[2].ad_storage === "granted") return true;
      }
    } catch (e) {}
    return false;
  }

  function sha256Email(email) {
    var value = String(email || "").trim().toLowerCase();
    var at = value.lastIndexOf("@");
    if (at > 0) {
      var local = value.slice(0, at);
      var domain = value.slice(at + 1);
      if (domain === "gmail.com" || domain === "googlemail.com") {
        value = local.split("+")[0].replace(/\./g, "") + "@gmail.com";
      }
    }
    if (!window.crypto || !window.crypto.subtle) return Promise.resolve("");
    return window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
    });
  }

  document.querySelectorAll("[data-qb-request]").forEach(function (form) {
    var steps = form.querySelectorAll(".qb-request-step");
    var num = form.querySelector("[data-step-num]");
    var name = form.querySelector("[data-step-name]");
    var bar = form.querySelector("[data-step-bar]");
    var space = form.querySelector("[data-space]");
    var area = form.querySelector("#qb-request-text");
    var errorBox = form.querySelector("[data-error]");
    var emailInput = form.querySelector('input[name="email"]');
    var current = 0;
    var emailTracked = false;

    function adapt() {
      var checked = form.querySelectorAll('input[name="need[]"]:checked');
      var custom = !checked.length;
      checked.forEach(function (box) {
        if (box.getAttribute("data-custom") === "1") custom = true;
      });
      if (space) space.hidden = !custom;
      if (area) {
        area.placeholder = checked.length
          ? checked[0].getAttribute("data-example") || area.getAttribute("data-default-placeholder")
          : area.getAttribute("data-default-placeholder");
      }
    }

    function show(index) {
      current = index;
      steps.forEach(function (step, i) {
        step.hidden = i !== index;
      });
      if (num) num.textContent = String(index + 1);
      if (name) name.textContent = steps[index].getAttribute("data-name") || "";
      if (bar) bar.style.width = Math.round(((index + 1) / steps.length) * 100) + "%";
      trackAnonymous("quotebuilder_step", { step: index + 1, step_name: steps[index].getAttribute("data-name") || "" });
    }

    function fill(field, value) {
      var input = form.querySelector('[name="' + field + '"]');
      if (input && value) input.value = value;
    }

    if (emailInput) {
      emailInput.addEventListener("blur", function () {
        if (!emailInput.checkValidity()) return;
        if (form.querySelector('[name="qb_website"]') && form.querySelector('[name="qb_website"]').value) return;
        if (!emailTracked) {
          emailTracked = true;
          trackAnonymous("quotebuilder_email", {});
        }
        var body = new FormData(form);
        body.append("action", "quotebuilder_quote");
        body.append("nonce", cfg.nonce);
        body.append("quote_action", "start_lead");
        fetch(cfg.ajax, { method: "POST", body: body, credentials: "same-origin" })
          .then(function (res) { return res.json(); })
          .then(function (json) {
            var hidden = form.querySelector('input[name="external_id"]');
            if (hidden && json && json.data && json.data.externalId) hidden.value = json.data.externalId;
          })
          .catch(function () {});
      });
    }

    form.addEventListener("change", function (event) {
      if (event.target.name === "need[]") adapt();
    });
    form.addEventListener("click", function (event) {
      if (event.target.closest("[data-next]")) show(Math.min(current + 1, steps.length - 1));
      if (event.target.closest("[data-prev]")) show(Math.max(current - 1, 0));
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var body = new FormData(form);
      var email = String(body.get("email") || "");
      var allowedAds = adsConsent();
      body.append("action", "quotebuilder_quote");
      body.append("nonce", cfg.nonce);
      body.append("quote_action", "submit_lead");
      if (allowedAds) body.append("consent_ads", "1");
      var button = form.querySelector("[data-submit]");
      if (button) button.disabled = true;
      fetch(cfg.ajax, { method: "POST", body: body, credentials: "same-origin" })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (!json.success) throw new Error((json.data && json.data.message) || "");
          var data = json.data || {};
          var first = String(body.get("name") || "").trim().split(" ")[0];
          form.innerHTML =
            '<div class="qb-request-done" role="status" tabindex="-1"><p>Merci' +
            (first ? " " + escapeHtml(first) : "") +
            ", c'est envoyé.</p><p>Un technicien vous rappelle " +
            escapeHtml(data.when || "dans l'heure") +
            " au " +
            escapeHtml(data.phone || body.get("phone") || "") +
            ".</p>" +
            (data.reference ? "<p>Votre référence : <strong>" + escapeHtml(data.reference) + "</strong></p>" : "") +
            "</div>";
          var done = form.querySelector(".qb-request-done");
          if (done) done.focus();
          trackAnonymous("quotebuilder_submit", { reference: data.reference || "" });
          document.dispatchEvent(new CustomEvent("quotebuilder:submitted", { detail: { reference: data.reference || "", quoteId: data.quoteId || "" } }));
          if (!allowedAds) return null;
          return sha256Email(email).then(function (hash) {
            if (!hash) return;
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event: "quotebuilder_ads", sha256_email: hash });
          });
        })
        .catch(function (error) {
          if (button) button.disabled = false;
          if (errorBox) {
            errorBox.hidden = false;
            errorBox.textContent = (error && error.message) || "L'envoi a échoué. Réessayez dans un instant.";
          }
        });
    });
    adapt();
    trackAnonymous("quotebuilder_start", {});
    var resume = "";
    try { resume = new URLSearchParams(window.location.search).get("qb_resume") || ""; } catch (e) {}
    if (resume) {
      var resumeBody = new FormData();
      resumeBody.append("action", "quotebuilder_quote");
      resumeBody.append("nonce", cfg.nonce);
      resumeBody.append("quote_action", "resume_lead");
      resumeBody.append("token", resume);
      fetch(cfg.ajax, { method: "POST", body: resumeBody, credentials: "same-origin" })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (!json.success || !json.data) {
            show(0);
            return;
          }
          var data = json.data;
          fill("name", data.name);
          fill("email", data.email);
          fill("phone", data.phone);
          fill("company", data.company);
          fill("city", data.city);
          fill("description", data.need);
          fill("length", data.length);
          fill("width", data.width);
          fill("height", data.height);
          (data.needs || []).forEach(function (value) {
            var box = form.querySelector('input[name="need[]"][value="' + String(value).replace(/["\\]/g, "") + '"]');
            if (box) box.checked = true;
          });
          adapt();
          show(steps.length - 1);
        })
        .catch(function () { show(0); });
    } else {
      show(0);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDrawer();
  });

  if (window.requestIdleCallback) {
    window.requestIdleCallback(trackVisit, { timeout: 2500 });
  } else {
    window.setTimeout(trackVisit, 0);
  }
})();
