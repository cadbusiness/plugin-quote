/** Browser runtime appended to /widget.js. Posts with the publishable site key. */
export function quoteWidgetClientScript(origin: string) {
  return `(() => {
  var APP = ${JSON.stringify(origin)};
  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
  function ensureStyle() {
    if (document.getElementById("qb-widget-style")) return;
    var style = document.createElement("style");
    style.id = "qb-widget-style";
    style.textContent = ".qb-w{font:14px/1.45 system-ui,sans-serif;color:#16110d;max-width:640px}"
      + ".qb-w *{box-sizing:border-box}"
      + ".qb-w-tabs{display:flex;gap:16px;border-bottom:1px solid #e7e5e4;margin:0 0 12px}"
      + ".qb-w-tabs button{background:none;border:0;border-bottom:2px solid transparent;padding:8px 0;cursor:pointer;color:#57534e}"
      + ".qb-w-tabs button.is-on{color:#E85D04;border-bottom-color:#E85D04;font-weight:600}"
      + ".qb-w label{display:block;margin:0 0 10px;font-size:13px}"
      + ".qb-w input,.qb-w textarea,.qb-w select{display:block;width:100%;margin-top:4px;padding:8px 10px;border:1px solid #e7e5e4;border-radius:6px;font:inherit;background:#fff}"
      + ".qb-w textarea{min-height:96px;resize:vertical}"
      + ".qb-w-line{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #f5f5f4}"
      + ".qb-w-line span{flex:1}"
      + ".qb-w-row{display:grid;grid-template-columns:1.2fr .8fr 72px 1fr auto;gap:8px;align-items:end}"
      + ".qb-w-actions{display:flex;gap:8px;align-items:center;margin-top:8px}"
      + ".qb-w button.qb-go{background:#E85D04;color:#fff;border:0;border-radius:6px;padding:8px 14px;cursor:pointer;font-weight:600}"
      + ".qb-w button.qb-go:disabled{opacity:.6;cursor:default}"
      + ".qb-w button.qb-quiet{background:#fff;border:1px solid #e7e5e4;border-radius:6px;padding:8px 10px;cursor:pointer}"
      + ".qb-w .qb-note{color:#78716c;font-size:12px;margin:8px 0 0}"
      + ".qb-w .qb-err{color:#be123c;font-size:13px;margin:8px 0 0}"
      + "@media(max-width:640px){.qb-w-row{grid-template-columns:1fr 1fr}}";
    document.head.appendChild(style);
  }
  function field(label, node) {
    var wrap = document.createElement("label");
    wrap.appendChild(document.createTextNode(label));
    wrap.appendChild(node);
    return wrap;
  }
  function input(type, value) {
    var node = document.createElement("input");
    node.type = type;
    if (value) node.value = value;
    return node;
  }
  function linesFrom(raw) {
    var parsed = raw;
    if (typeof raw === "string" && raw) {
      try { parsed = JSON.parse(raw); } catch (e) { parsed = []; }
    }
    if (!Array.isArray(parsed)) return [];
    var lines = [];
    for (var i = 0; i < parsed.length && lines.length < 100; i++) {
      var row = parsed[i];
      if (!row || typeof row !== "object") continue;
      var productId = String(row.productId || row.id || "").trim();
      if (!productId || productId === "0") continue;
      var variationId = String(row.variationId != null ? row.variationId : (row.variation_id || "")).trim();
      if (variationId === "0") variationId = "";
      var qty = Number(row.qty || row.quantity || 1);
      if (!isFinite(qty) || qty < 1) qty = 1;
      var selected = null;
      if (row.selected && typeof row.selected === "object") selected = row.selected;
      lines.push({
        productId: productId.slice(0, 64),
        variationId: variationId.slice(0, 64),
        name: String(row.name || "").trim().slice(0, 300),
        qty: Math.min(9999, Math.round(qty)),
        sku: String(row.sku || "").trim().slice(0, 80),
        variation: String(row.variation || "").trim().slice(0, 300),
        url: String(row.url || "").trim().slice(0, 2000),
        selected: selected
      });
    }
    return lines;
  }
  function localConfig(el) {
    var mode = el.getAttribute("data-mode");
    if (mode !== "catalog" && mode !== "request") mode = "both";
    var ai = el.getAttribute("data-ai");
    return { mode: mode, aiRequestText: ai === "1" || ai === "true" };
  }
  function publicPath(key, suffix) {
    return "/api/public/sites/" + key + suffix;
  }
  function call(key, path, method, body) {
    var headers = { "x-quotebuilder-site-key": key };
    var init = { method: method, headers: headers };
    if (body) {
      headers["content-type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    return fetch(APP + path, init).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        return { status: res.status, data: data };
      });
    });
  }
  function catalogOf(data) {
    return data && Array.isArray(data.catalog) ? data.catalog : [];
  }
  function resolveProduct(product, selected) {
    var axes = product.axes || [];
    if (!axes.length) {
      return { variationId: "", sku: product.sku || "", variation: "", selected: null };
    }
    for (var i = 0; i < axes.length; i++) {
      if (!selected[axes[i].key]) return { error: "Choisissez chaque option." };
    }
    var variations = product.variations || [];
    for (var v = 0; v < variations.length; v++) {
      var variant = variations[v];
      var map = variant.selected || {};
      var ok = true;
      for (var a = 0; a < axes.length; a++) {
        if (String(map[axes[a].key] || "") !== String(selected[axes[a].key] || "")) ok = false;
      }
      if (!ok) continue;
      return {
        variationId: String(variant.id || ""),
        sku: variant.sku || "",
        variation: variant.label || "",
        selected: selected
      };
    }
    return { error: "Cette combinaison n'existe pas." };
  }
  function mount(el) {
    if (el.getAttribute("data-qb-ready") === "1") return;
    el.setAttribute("data-qb-ready", "1");
    var key = (el.getAttribute("data-site-key") || "").trim();
    ensureStyle();
    el.innerHTML = "";
    el.classList.add("qb-w");
    if (!key || key.indexOf("qb_site_") !== 0) {
      var missing = document.createElement("p");
      missing.className = "qb-err";
      missing.textContent = "Clé site manquante.";
      el.appendChild(missing);
      return;
    }
    var fallback = localConfig(el);
    var externalId = "w" + uuid().replace(/-/g, "");
    call(key, publicPath(key, "/widget"), "GET").then(function (res) {
      var config = fallback;
      if (res.status === 200 && res.data && (res.data.mode === "catalog" || res.data.mode === "request" || res.data.mode === "both")) {
        config = { mode: res.data.mode, aiRequestText: !!res.data.aiRequestText };
      }
      render(el, key, externalId, config, linesFrom(el.getAttribute("data-cart")), catalogOf(res.data));
    }).catch(function () {
      render(el, key, externalId, fallback, linesFrom(el.getAttribute("data-cart")), []);
    });
  }
  function render(root, key, externalId, config, lines, catalog) {
    root.innerHTML = "";
    var active = config.mode === "catalog" || (config.mode === "both" && lines.length) ? "catalog" : "request";
    var name = input("text", "");
    var email = input("email", "");
    var phone = input("tel", "");
    var company = input("text", "");
    var need = document.createElement("textarea");
    need.maxLength = 8000;
    need.placeholder = "Dimensions, usage, contraintes";
    var status = document.createElement("p");
    status.className = "qb-note";
    var error = document.createElement("p");
    error.className = "qb-err";
    error.hidden = true;
    var catalogBox = document.createElement("div");
    var requestBox = document.createElement("div");
    function paintLines() {
      catalogBox.innerHTML = "";
      if (!lines.length) {
        var empty = document.createElement("p");
        empty.className = "qb-note";
        empty.textContent = catalog.length
          ? "Choisissez un produit, puis ses options."
          : "Ajoutez un produit connu (identifiant boutique, variation, quantité).";
        catalogBox.appendChild(empty);
      }
      lines.forEach(function (line, index) {
        var row = document.createElement("div");
        row.className = "qb-w-line";
        var label = document.createElement("span");
        var title = line.name || ("Produit " + line.productId);
        label.textContent = title + (line.variation ? " (" + line.variation + ")" : "") + " · " + line.qty;
        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "qb-quiet";
        remove.textContent = "Retirer";
        remove.addEventListener("click", function () {
          lines.splice(index, 1);
          paintLines();
        });
        row.appendChild(label);
        row.appendChild(remove);
        catalogBox.appendChild(row);
      });
      var qty = input("number", "1");
      qty.min = "1";
      var add = document.createElement("button");
      add.type = "button";
      add.className = "qb-quiet";
      add.textContent = "Ajouter";
      var grid = document.createElement("div");
      grid.className = "qb-w-row";
      if (catalog.length) {
        var productPick = document.createElement("select");
        var blank = document.createElement("option");
        blank.value = "";
        blank.textContent = "Choisir";
        productPick.appendChild(blank);
        catalog.forEach(function (product) {
          if (!product || !product.externalId) return;
          var option = document.createElement("option");
          option.value = product.externalId;
          option.textContent = product.name || product.externalId;
          productPick.appendChild(option);
        });
        var axisBox = document.createElement("div");
        axisBox.style.display = "contents";
        function paintAxes() {
          axisBox.innerHTML = "";
          var product = null;
          for (var i = 0; i < catalog.length; i++) {
            if (catalog[i].externalId === productPick.value) product = catalog[i];
          }
          (product && product.axes ? product.axes : []).forEach(function (axis) {
            var select = document.createElement("select");
            select.setAttribute("data-axis", axis.key);
            var emptyOption = document.createElement("option");
            emptyOption.value = "";
            emptyOption.textContent = "Choisir";
            select.appendChild(emptyOption);
            (axis.options || []).forEach(function (choice) {
              var option = document.createElement("option");
              option.value = choice.value;
              option.textContent = choice.label || choice.value;
              select.appendChild(option);
            });
            axisBox.appendChild(field(axis.name || axis.key, select));
          });
        }
        productPick.addEventListener("change", function () {
          error.hidden = true;
          paintAxes();
        });
        add.addEventListener("click", function () {
          error.hidden = true;
          var product = null;
          for (var i = 0; i < catalog.length; i++) {
            if (catalog[i].externalId === productPick.value) product = catalog[i];
          }
          if (!product) return;
          var selected = {};
          Array.prototype.forEach.call(axisBox.querySelectorAll("select"), function (select) {
            selected[select.getAttribute("data-axis")] = select.value;
          });
          var resolved = resolveProduct(product, selected);
          if (!resolved || resolved.error) {
            error.hidden = false;
            error.textContent = (resolved && resolved.error) || "Cette combinaison n'existe pas.";
            return;
          }
          var next = linesFrom([{
            productId: product.externalId,
            variationId: resolved.variationId,
            qty: qty.value,
            name: product.name,
            sku: resolved.sku,
            variation: resolved.variation,
            selected: resolved.selected
          }]);
          if (next[0]) lines.push(next[0]);
          paintLines();
        });
        grid.appendChild(field("Produit", productPick));
        grid.appendChild(axisBox);
        grid.appendChild(field("Qté", qty));
        grid.appendChild(add);
      } else {
        var productId = input("text", "");
        var variationId = input("text", "");
        var productName = input("text", "");
        add.addEventListener("click", function () {
          var id = productId.value.trim();
          if (!id) return;
          var next = linesFrom([{
            productId: id,
            variationId: variationId.value,
            qty: qty.value,
            name: productName.value
          }]);
          if (next[0]) lines.push(next[0]);
          paintLines();
        });
        grid.appendChild(field("Produit", productId));
        grid.appendChild(field("Variation", variationId));
        grid.appendChild(field("Qté", qty));
        grid.appendChild(field("Nom", productName));
        grid.appendChild(add);
      }
      catalogBox.appendChild(grid);
    }
    function show(mode) {
      active = mode;
      catalogBox.hidden = mode !== "catalog";
      requestBox.hidden = mode !== "request";
      Array.prototype.forEach.call(root.querySelectorAll(".qb-w-tabs button"), function (button) {
        button.classList.toggle("is-on", button.getAttribute("data-mode") === mode);
      });
    }
    if (config.mode === "both") {
      var tabs = document.createElement("div");
      tabs.className = "qb-w-tabs";
      ["catalog", "request"].forEach(function (mode) {
        var button = document.createElement("button");
        button.type = "button";
        button.setAttribute("data-mode", mode);
        button.textContent = mode === "catalog" ? "Catalogue" : "Décrire mon besoin";
        button.addEventListener("click", function () { show(mode); });
        tabs.appendChild(button);
      });
      root.appendChild(tabs);
    }
    paintLines();
    root.appendChild(catalogBox);
    requestBox.appendChild(field("Votre besoin", need));
    if (config.aiRequestText) {
      var hint = document.createElement("p");
      hint.className = "qb-note";
      hint.textContent = "Le texte est conservé tel quel. S'il correspond à un produit du catalogue, une ligne peut être proposée.";
      requestBox.appendChild(hint);
    }
    root.appendChild(requestBox);
    root.appendChild(field("Nom", name));
    root.appendChild(field("E-mail", email));
    root.appendChild(field("Téléphone", phone));
    root.appendChild(field("Société (facultatif)", company));
    var go = document.createElement("button");
    go.type = "button";
    go.className = "qb-go";
    go.textContent = "Envoyer la demande";
    var actions = document.createElement("div");
    actions.className = "qb-w-actions";
    actions.appendChild(go);
    root.appendChild(actions);
    root.appendChild(error);
    root.appendChild(status);
    show(active);
    go.addEventListener("click", function () {
      if (go.disabled) return;
      error.hidden = true;
      var requestText = active === "catalog" ? "" : need.value.trim();
      var items = active === "request" ? [] : lines.slice();
      if (active === "catalog" && !items.length) {
        error.hidden = false;
        error.textContent = "Ajoutez un produit ou décrivez le besoin.";
        return;
      }
      if (active !== "catalog" && requestText.length < 3) {
        error.hidden = false;
        error.textContent = "Décrivez le besoin en quelques mots.";
        return;
      }
      go.disabled = true;
      status.textContent = config.aiRequestText && active !== "catalog" ? "Lecture du besoin…" : "Envoi…";
      var pending = Promise.resolve({ brief: "", items: items });
      if (config.aiRequestText && active !== "catalog") {
        pending = call(key, publicPath(key, "/assist"), "POST", { requestText: requestText }).then(function (res) {
          if (res.status !== 200 || !res.data) return { brief: "", items: [] };
          var suggested = Array.isArray(res.data.items) ? linesFrom(res.data.items) : [];
          return { brief: typeof res.data.brief === "string" ? res.data.brief : "", items: suggested };
        }).catch(function () {
          return { brief: "", items: [] };
        });
      }
      pending.then(function (assist) {
        var payloadItems = active === "request" ? assist.items : items;
        var body = {
          source: "wordpress",
          externalId: externalId,
          pageUrl: String(window.location.href || "").slice(0, 2000),
          contact: {
            name: name.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            company: company.value.trim()
          },
          items: payloadItems.map(function (line) {
            return {
              productId: line.productId,
              variationId: line.variationId,
              name: line.name,
              variation: line.variation,
              qty: line.qty,
              sku: line.sku,
              url: line.url,
              selected: line.selected || undefined
            };
          }),
          requestText: requestText
        };
        if (assist.brief) body.context = assist.brief.slice(0, 500);
        status.textContent = "Envoi…";
        return call(key, publicPath(key, "/quotes"), "POST", body);
      }).then(function (res) {
        if (!res || (res.status !== 201 && res.status !== 200) || !res.data || !res.data.id) {
          go.disabled = false;
          status.textContent = "";
          error.hidden = false;
          error.textContent = (res && res.data && res.data.error) || "La demande n'a pas pu être envoyée.";
          return;
        }
        root.innerHTML = "";
        var done = document.createElement("p");
        done.textContent = "Demande envoyée. L'équipe commerciale la reçoit.";
        root.appendChild(done);
      }).catch(function () {
        go.disabled = false;
        status.textContent = "";
        error.hidden = false;
        error.textContent = "La demande n'a pas pu être envoyée.";
      });
    });
  }
  function init() {
    document.querySelectorAll("[data-qb-widget], [data-module='quote']").forEach(mount);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();`;
}