/* eslint-disable */
// @ts-nocheck
/** Minimal DOM used to run the original render() of a public tool. */

function Element(tag, id) {
  this.tag = tag || "div";
  this.id = id || "";
  this.className = "";
  this.type = "text";
  this._text = "";
  this._value = "";
  this._checked = false;
  this.children = [];
  this.parent = null;
}

Object.defineProperty(Element.prototype, "textContent", {
  get() {
    return this._text;
  },
  set(v) {
    this._text = v == null ? "" : String(v);
  },
});

Object.defineProperty(Element.prototype, "value", {
  get() {
    return this._value == null ? "" : String(this._value);
  },
  set(v) {
    this._value = v;
  },
});

Object.defineProperty(Element.prototype, "checked", {
  get() {
    return !!this._checked;
  },
  set(v) {
    this._checked = !!v;
  },
});

Object.defineProperty(Element.prototype, "innerHTML", {
  get() {
    return this._text;
  },
  set(v) {
    this.children = [];
    const html = v == null ? "" : String(v);
    this._text = "";
    if (!html) return;
    if (this.tag === "tr") {
      const cells = html.match(/<td>([\s\S]*?)<\/td>/g) || [];
      for (const cell of cells) {
        const td = new Element("td");
        td._text = cell.replace(/^<td>/, "").replace(/<\/td>$/, "");
        td.parent = this;
        this.children.push(td);
      }
    }
  },
});

Object.defineProperty(Element.prototype, "firstChild", {
  get() {
    return this.children[0] || null;
  },
});

Element.prototype.appendChild = function appendChild(child) {
  if (!child) return child;
  child.parent = this;
  this.children.push(child);
  return child;
};

Element.prototype.removeChild = function removeChild(child) {
  const index = this.children.indexOf(child);
  if (index >= 0) this.children.splice(index, 1);
  return child;
};

Element.prototype.addEventListener = function addEventListener() {};

export function createToolDom(values) {
  const nodes = new Map();
  function make(id) {
    let node = nodes.get(id);
    if (!node) {
      node = new Element("div", id);
      nodes.set(id, node);
    }
    if (values && Object.prototype.hasOwnProperty.call(values, id)) {
      const raw = values[id];
      if (typeof raw === "boolean") {
        node._checked = raw;
        node.type = "checkbox";
        node._value = raw ? "on" : "";
      } else if (node._value === "" && node.type !== "checkbox") {
        node._value = raw == null ? "" : String(raw);
      }
    }
    return node;
  }
  const document = {
    getElementById(id) {
      return make(id);
    },
    createElement(tag) {
      return new Element(tag);
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
  };
  return {
    document,
    snapshot() {
      const out = {};
      for (const [id, el] of nodes) {
        out[id] = {
          text: el._text,
          className: el.className || "",
          rows: el.children
            .filter((child) => child.tag === "tr")
            .map((row) => ({
              className: row.className || "",
              cells: row.children.filter((child) => child.tag === "td").map((cell) => cell._text),
            })),
          items: el.children.filter((child) => child.tag === "li").map((item) => item._text),
        };
      }
      return out;
    },
  };
}
