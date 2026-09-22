import assert from "node:assert/strict";
import {
  acceptManualText,
  mapWooProductSheet,
  parseProductSheet,
  readSheetField,
  sheetRoleFromText,
  storedSheetForSync,
  wooSheetMeta,
} from "./sheet";

const description = "<p>Rayonnage lourd galvanisé pour entrepôt.</p><ul><li>Charge 1000 kg</li><li>Hauteur 250 cm</li></ul>";

assert.equal(sheetRoleFromText("notice-d-emploi-unirack.pdf"), "manual");
assert.equal(sheetRoleFromText("declaration-ce.pdf"), "certificate");
assert.equal(sheetRoleFromText("garantie-2-ans.pdf"), "warranty");
assert.equal(sheetRoleFromText("photo-studio.jpg"), null);
assert.equal(acceptManualText(description, description), "");
assert.equal(acceptManualText("Visser les montants, puis clipser les lisses.", description), "Visser les montants, puis clipser les lisses.");

{
  const dumped = mapWooProductSheet({
    description,
    meta_data: [{ key: "_qb_manual", value: description }],
    downloads: [
      { name: "Notice de montage", file: "https://quickly-int.com/wp-content/uploads/notice-montage.pdf" },
      { name: "Photo studio", file: "https://quickly-int.com/wp-content/uploads/studio.jpg" },
      { name: "Déclaration CE", file: "https://quickly-int.com/wp-content/uploads/declaration-ce.pdf" },
    ],
  });
  assert.equal(dumped.manualText, "");
  assert.equal(dumped.documents.find((doc) => doc.role === "manual")?.src.endsWith("notice-montage.pdf"), true);
  assert.equal(dumped.documents.some((doc) => doc.src.endsWith("studio.jpg")), false);
  assert.equal(dumped.documents.find((doc) => doc.role === "certificate")?.label, "Déclaration CE");
}

{
  const sheet = mapWooProductSheet({
    description,
    meta_data: [
      {
        key: "_qb_manual",
        value: { url: "https://cdn.example/mode-emploi.pdf", text: "Assembler les échelles avant les lisses." },
      },
      { key: "_qb_warranty", value: "https://cdn.example/garantie.pdf" },
    ],
  });
  assert.equal(sheet.manualText, "Assembler les échelles avant les lisses.");
  assert.equal(sheet.documents.find((doc) => doc.role === "manual")?.src, "https://cdn.example/mode-emploi.pdf");
  assert.equal(sheet.documents.find((doc) => doc.role === "warranty")?.label, "Garantie");
  assert.equal(parseProductSheet(JSON.stringify(sheet)).manualText, sheet.manualText);
}

{
  const prior = {
    manualText: "Notice saisie à la main",
    documents: [
      { role: "manual", src: "https://cdn.example/ancienne.pdf", label: "Ancienne" },
      { role: "warranty", src: "https://cdn.example/garantie.pdf", label: "Garantie" },
    ],
  };
  assert.equal(storedSheetForSync({ manualText: "", documents: [] }, prior)?.manualText, "Notice saisie à la main");
  const replaced = storedSheetForSync(
    {
      manualText: "",
      documents: [{ role: "manual", src: "https://cdn.example/nouvelle.pdf", label: "Notice" }],
    },
    prior,
  );
  assert.equal(replaced?.documents.find((doc) => doc.role === "manual")?.src, "https://cdn.example/nouvelle.pdf");
  assert.equal(replaced?.documents.find((doc) => doc.role === "warranty")?.src, "https://cdn.example/garantie.pdf");
  assert.equal(replaced?.manualText, "Notice saisie à la main");
}

{
  const form = new FormData();
  form.set("manual_text", "Poser les platines, puis les montants.");
  form.append("sheet_doc_role", "manual");
  form.append("sheet_doc_url", "https://cdn.example/notice.pdf");
  form.append("sheet_doc_label", "Notice PDF");
  form.append("sheet_doc_role", "certificate");
  form.append("sheet_doc_url", "");
  form.append("sheet_doc_label", "");
  const sheet = readSheetField(form);
  assert.equal(sheet?.manualText, "Poser les platines, puis les montants.");
  assert.equal(sheet?.documents.length, 1);
  assert.deepEqual(wooSheetMeta(sheet!), [
    {
      key: "_qb_manual",
      value: { url: "https://cdn.example/notice.pdf", label: "Notice PDF", text: sheet!.manualText },
    },
  ]);
}

console.log("catalog/sheet ok");
