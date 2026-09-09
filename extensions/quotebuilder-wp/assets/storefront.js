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

  function paint(data) {
    var fab = document.querySelector(".qb-fab");
    if (fab) {
      fab.hidden = !data.count;
      var badge = fab.querySelector("span");
      if (badge) badge.textContent = data.count;
      fab.setAttribute("data-count", data.count);
    }
    var list = document.querySelector(".qb-drawer-items");
    if (list && data.items) {
      list.innerHTML = data.items
        .map(function (item) {
          return "<li><span>" + escapeHtml(item.name) + "</span><em>×" + item.qty + "</em></li>";
        })
        .join("");
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
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
        if (json.data.already) {
          toast(cfg.alreadyInListLabel || "Ce produit figure déjà dans votre liste de devis.", true);
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
        var drawer = document.querySelector(".qb-drawer");
        if (drawer) drawer.hidden = false;
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
      if (drawer) drawer.hidden = !drawer.hidden;
    }

    if (event.target.closest(".qb-drawer-close")) {
      var drawerClose = document.querySelector(".qb-drawer");
      if (drawerClose) drawerClose.hidden = true;
    }

    var remove = event.target.closest(".qb-remove");
    if (remove) {
      var row = remove.closest("li");
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
})();
