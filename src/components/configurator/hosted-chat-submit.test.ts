import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { HostedChatSubmit, shouldShowHostedChatSubmit } from "./hosted-chat-submit";

assert.equal(shouldShowHostedChatSubmit({ chatOnly: true, screenType: "contact" }), true);
assert.equal(shouldShowHostedChatSubmit({ chatOnly: true, screenType: "questions" }), false);
assert.equal(shouldShowHostedChatSubmit({ chatOnly: true, screenType: "suggestions" }), false);
assert.equal(shouldShowHostedChatSubmit({ chatOnly: true, screenType: "customize" }), false);
assert.equal(shouldShowHostedChatSubmit({ chatOnly: true, screenType: null }), false);
assert.equal(shouldShowHostedChatSubmit({ chatOnly: false, screenType: "contact" }), false);

const contact = {
  name: "Claire Martin",
  email: "claire@example.com",
  phone: "0600000000",
  company: "Atelier Sud",
  consentMarketing: false,
};

const html = renderToStaticMarkup(
  createElement(HostedChatSubmit, {
    title: "Vos coordonnées",
    subtitle: "Recevez le récapitulatif de votre projet",
    contact,
    busy: false,
    accent: "#E85D04",
    themed: false,
    onChange: () => undefined,
    onSubmit: () => undefined,
  }),
);

assert.match(html, /Vos coordonnées/);
assert.match(html, /Recevez le récapitulatif/);
assert.match(html, /Nom/);
assert.match(html, /Email/);
assert.match(html, /Téléphone/);
assert.match(html, /Société/);
assert.match(html, /value="Claire Martin"/);
assert.match(html, /value="claire@example.com"/);
assert.match(html, /Envoyer ma demande/);
assert.match(html, /consentement marketing/);
assert.doesNotMatch(html, /Retour/);
assert.doesNotMatch(html, /Envoi…/);

const busy = renderToStaticMarkup(
  createElement(HostedChatSubmit, {
    title: "Vos coordonnées",
    contact,
    busy: true,
    error: "Coordonnées invalides",
    accent: "#E85D04",
    themed: true,
    onChange: () => undefined,
    onSubmit: () => undefined,
  }),
);
assert.match(busy, /Envoi…/);
assert.match(busy, /Coordonnées invalides/);
assert.doesNotMatch(busy, /Envoyer ma demande/);

const app = readFileSync(new URL("./configurator-app.tsx", import.meta.url), "utf8");
const wizardAt = app.indexOf("{showWizard && step ? (");
const wizardEnd = app.indexOf("</section>", wizardAt);
const hostedAt = app.indexOf("<HostedChatSubmit");
assert.ok(wizardAt > 0, "wizard steps stay behind showWizard");
assert.ok(wizardEnd > wizardAt);
assert.ok(hostedAt > 0, "hosted chat submit is mounted");
assert.ok(hostedAt < wizardAt || hostedAt > wizardEnd, "chat submit stays outside the wizard branch");
const wizardSlice = app.slice(wizardAt, wizardEnd);
assert.match(wizardSlice, /screenType === "contact"/);
assert.match(wizardSlice, /onClick=\{submit\}/);
assert.match(wizardSlice, /Envoyer ma demande/);
assert.doesNotMatch(wizardSlice, /HostedChatSubmit/);
assert.match(app, /onSubmit=\{\(\) => void submit\(\)\}/);
assert.match(app, /shouldShowHostedChatSubmit\(\{/);
