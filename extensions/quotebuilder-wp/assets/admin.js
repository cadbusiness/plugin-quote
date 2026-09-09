(function () {
  var cfg = window.QuoteBuilderAdmin || {};
  var storefront = Object.assign({}, cfg.storefront || {});

  function post(action, data) {
    var body = new FormData();
    body.append("action", action);
    body.append("_wpnonce", cfg.nonce);
    Object.keys(data || {}).forEach(function (key) {
      body.append(key, data[key]);
    });
    return fetch(cfg.ajax, { method: "POST", body: body }).then(function (res) {
      return res.json();
    });
  }

  function gather(form) {
    var next = Object.assign({}, storefront);
    var lists = {};
    form.querySelectorAll("input, select, textarea").forEach(function (field) {
      if (!field.name) return;
      if (field.name.slice(-2) === "[]") {
        var key = field.name.slice(0, -2);
        if (!lists[key]) lists[key] = [];
        if (field.type === "checkbox") {
          if (field.checked) lists[key].push(field.value);
        } else if (field.value) {
          lists[key].push(field.value);
        }
        return;
      }
      if (field.type === "radio") {
        if (field.checked) next[field.name] = field.value;
        return;
      }
      if (field.type === "checkbox") next[field.name] = field.checked;
      else next[field.name] = field.value;
    });
    Object.keys(lists).forEach(function (key) {
      next[key] = lists[key];
    });
    form.querySelectorAll("[data-chips]").forEach(function (box) {
      next[box.getAttribute("data-chips")] = Array.prototype.map.call(box.querySelectorAll("button"), function (chip) {
        return chip.getAttribute("data-id");
      });
    });
    return next;
  }

  function syncConditional(form) {
    form.querySelectorAll("[data-show-when]").forEach(function (el) {
      var spec = (el.getAttribute("data-show-when") || "").split(":");
      var name = spec[0];
      var values = (spec[1] || "").split("|");
      var field = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]');
      var current = field ? field.value : "";
      el.hidden = values.indexOf(current) === -1;
    });
  }

  function paintPreview() {
    var btn = document.getElementById("qb-preview-btn");
    if (!btn) return;
    var form = btn.closest("form");
    if (!form) return;
    var data = gather(form);
    btn.textContent = data.buttonLabel;
    btn.style.background = data.buttonBg;
    btn.style.color = data.buttonColor;
    btn.style.borderColor = data.buttonBorder;
    btn.className = data.buttonStyle === "link" ? "qb-atq qb-atq-link" : "qb-atq";
    var price = form.querySelector(".qb-price-hidden");
    if (price && data.priceLabel) price.textContent = data.priceLabel;
  }

  document.querySelectorAll("[data-qb-form]").forEach(function (form) {
    syncConditional(form);
    form.addEventListener("input", function () {
      syncConditional(form);
      paintPreview();
    });
    form.addEventListener("change", function () {
      syncConditional(form);
      paintPreview();
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var payload = gather(form);
      post("quotebuilder_save_storefront", { payload: JSON.stringify(payload) }).then(function (json) {
        if (json.success) {
          storefront = json.data.storefront;
          var btn = form.querySelector("[type=submit]");
          if (btn) {
            var previous = btn.textContent;
            btn.textContent = "Enregistré";
            setTimeout(function () {
              btn.textContent = previous;
            }, 1200);
          }
        }
      });
    });
  });
  paintPreview();

  var sub = document.querySelector("[data-qb-subnav]");
  if (sub) {
    sub.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        var id = (link.getAttribute("href") || "").replace("#", "");
        var target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        sub.querySelectorAll("a").forEach(function (item) {
          item.classList.toggle("is-active", item === link);
        });
      });
    });
  }

  var createPage = document.getElementById("qb-create-page");
  if (createPage) {
    createPage.addEventListener("click", function () {
      post("quotebuilder_create_quote_page").then(function (json) {
        if (!json.success || !json.data) return;
        var select = document.querySelector("[name=quotePageId]");
        if (!select) return;
        var existing = select.querySelector('option[value="' + json.data.id + '"]');
        if (existing) {
          existing.selected = true;
          return;
        }
        var opt = document.createElement("option");
        opt.value = json.data.id;
        opt.textContent = json.data.title;
        opt.selected = true;
        select.appendChild(opt);
      });
    });
  }

  function pair() {
    var code = document.getElementById("qb-code");
    var origin = document.getElementById("qb-origin");
    var status = document.getElementById("qb-pair-status");
    var run = function () {
      return post("quotebuilder_pair", { code: code ? code.value : "" }).then(function (json) {
        if (status) {
          status.hidden = false;
          status.className = "qb-status" + (json.success ? " is-ok" : "");
          status.textContent = json.success
            ? "Catalogue connecté. Rechargez la page."
            : (json.data && json.data.message) || "Appairage impossible.";
        }
        if (json.success) setTimeout(function () { window.location.reload(); }, 700);
      });
    };
    if (origin) {
      post("quotebuilder_save_origin", { origin: origin.value }).then(run);
    } else {
      run();
    }
  }

  var pairBtn = document.getElementById("qb-pair");
  if (pairBtn) pairBtn.addEventListener("click", pair);

  var originBtn = document.getElementById("qb-save-origin");
  if (originBtn) {
    originBtn.addEventListener("click", function () {
      var origin = document.getElementById("qb-origin");
      post("quotebuilder_save_origin", { origin: origin ? origin.value : "" });
    });
  }

  var unpair = document.getElementById("qb-unpair");
  if (unpair) {
    unpair.addEventListener("click", function () {
      if (!window.confirm("Déconnecter le catalogue de ce site ?")) return;
      post("quotebuilder_unpair").then(function () {
        window.location.reload();
      });
    });
  }

  var sync = document.getElementById("qb-sync");
  if (sync) {
    sync.addEventListener("click", function () {
      var previous = sync.textContent;
      sync.textContent = "Synchronisation…";
      post("quotebuilder_sync").then(function (json) {
        sync.textContent = json.success ? "Catalogue à jour" : previous;
        if (json.success) setTimeout(function () { window.location.reload(); }, 700);
      });
    });
  }

  var refresh = document.getElementById("qb-refresh");
  if (refresh) {
    refresh.addEventListener("click", function () {
      post("quotebuilder_refresh").then(function () {
        window.location.reload();
      });
    });
  }

  document.querySelectorAll("[data-search]").forEach(function (input) {
    var kind = input.getAttribute("data-search");
    var chips = input.parentElement.querySelector("[data-chips]");
    var box = document.createElement("div");
    box.className = "qb-suggest";
    input.after(box);
    input.addEventListener("input", function () {
      var q = input.value.trim();
      if (q.length < 2) {
        box.innerHTML = "";
        return;
      }
      var action = "quotebuilder_search_products";
      if (kind === "categories") action = "quotebuilder_search_categories";
      if (kind === "tags") action = "quotebuilder_search_tags";
      fetch(cfg.ajax + "?action=" + action + "&_wpnonce=" + encodeURIComponent(cfg.nonce) + "&q=" + encodeURIComponent(q))
        .then(function (res) { return res.json(); })
        .then(function (json) {
          box.innerHTML = "";
          (json.data && json.data.items ? json.data.items : []).forEach(function (item) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = item.name;
            btn.addEventListener("click", function () {
              if (chips.querySelector('[data-id="' + item.id + '"]')) return;
              var chip = document.createElement("button");
              chip.type = "button";
              chip.setAttribute("data-id", item.id);
              chip.textContent = item.name;
              chip.addEventListener("click", function () { chip.remove(); });
              chips.appendChild(chip);
            });
            box.appendChild(btn);
          });
        });
    });
    chips.querySelectorAll("button").forEach(function (chip) {
      chip.addEventListener("click", function () { chip.remove(); });
    });
  });
})();
