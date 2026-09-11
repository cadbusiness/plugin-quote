import assert from "node:assert/strict";
import { boxStyle } from "./layout";
import {
  cx,
  headingClass,
  heroPadClass,
  isMeaningfulCss,
  isShopCta,
  publicBoxInput,
  renderBoxStyle,
  sectionPadClass,
} from "./storefront-style";

assert.equal(isMeaningfulCss(""), false);
assert.equal(isMeaningfulCss("  "), false);
assert.equal(isMeaningfulCss("0"), false);
assert.equal(isMeaningfulCss("0px"), false);
assert.equal(isMeaningfulCss("0 0"), false);
assert.equal(isMeaningfulCss("0px 0px"), false);
assert.equal(isMeaningfulCss("64px 0"), true);
assert.equal(isMeaningfulCss("16px"), true);

assert.equal(sectionPadClass(""), "py-12 md:py-16");
assert.equal(sectionPadClass("0px"), "py-12 md:py-16");
assert.equal(sectionPadClass("40px 0"), "");
assert.equal(heroPadClass(""), "py-16 md:py-20 lg:py-24");
assert.equal(
  renderBoxStyle({ background: "#111111" }, { background: "#E85D04" }).background,
  "#111111",
);
assert.equal(headingClass({ fontSize: "28px" }, "h2").includes("text-2xl"), false);
assert.equal(headingClass({}, "h2").includes("text-2xl"), true);

const overlay = publicBoxInput({
  padding: "0px",
  margin: "",
  position: "absolute",
  top: "12px",
  left: "0",
  zIndex: "4",
  background: "#fff",
});
assert.equal(overlay.padding, undefined);
assert.equal(overlay.position, undefined);
assert.equal(overlay.top, undefined);
assert.equal(overlay.background, "#fff");

const stacked = renderBoxStyle({ padding: "0", position: "absolute", top: "0" });
assert.equal(stacked.padding, undefined);
assert.equal(stacked.position, undefined);
assert.equal(boxStyle({ padding: "0", position: "absolute", top: "0" }).position, "absolute");

assert.equal(isShopCta({ label: "Demander un devis", href: "/contact" }), true);
assert.equal(isShopCta({ label: "Contact", href: "/c/demo/rayonnage" }), true);
assert.equal(isShopCta({ label: "Catalogue", href: "/catalogue" }), false);

assert.equal(cx("a", false, undefined, "b"), "a b");

console.log("storefront-style tests ok");
