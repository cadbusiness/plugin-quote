(function (blocks, element, components) {
  var el = element.createElement;
  var TextControl = components.TextControl;

  blocks.registerBlockType("quotebuilder/embed", {
    title: "QuoteBuilder",
    icon: "clipboard",
    category: "widgets",
    attributes: {
      org: { type: "string", default: "" },
      id: { type: "string", default: "" },
      height: { type: "string", default: "720px" },
    },
    edit: function (props) {
      return el("div", { className: "quotebuilder-block-editor" }, [
        el("p", { key: "hint", className: "components-placeholder__instructions" }, "Laissez vide pour utiliser le funnel appairé."),
        el(TextControl, {
          key: "org",
          label: "Organisation",
          value: props.attributes.org,
          onChange: function (value) {
            props.setAttributes({ org: value });
          },
        }),
        el(TextControl, {
          key: "id",
          label: "Funnel",
          value: props.attributes.id,
          onChange: function (value) {
            props.setAttributes({ id: value });
          },
        }),
        el(TextControl, {
          key: "height",
          label: "Hauteur",
          value: props.attributes.height,
          onChange: function (value) {
            props.setAttributes({ height: value });
          },
        }),
      ]);
    },
    save: function () {
      return null;
    },
  });

  blocks.registerBlockType("quotebuilder/capture", {
    title: "Question devis",
    icon: "format-chat",
    category: "widgets",
    attributes: {
      org: { type: "string", default: "" },
      id: { type: "string", default: "" },
      placeholder: { type: "string", default: "" },
      promise: { type: "string", default: "" },
      phone: { type: "string", default: "" },
    },
    edit: function (props) {
      return el("div", { className: "quotebuilder-block-editor" }, [
        el("p", { key: "hint", className: "components-placeholder__instructions" }, "Carte « Une question sur votre projet ? ». Vide = funnel appairé."),
        el(TextControl, {
          key: "org",
          label: "Organisation",
          value: props.attributes.org,
          onChange: function (value) { props.setAttributes({ org: value }); },
        }),
        el(TextControl, {
          key: "id",
          label: "Funnel",
          value: props.attributes.id,
          onChange: function (value) { props.setAttributes({ id: value }); },
        }),
        el(TextControl, {
          key: "placeholder",
          label: "Exemple dans le champ",
          value: props.attributes.placeholder,
          onChange: function (value) { props.setAttributes({ placeholder: value }); },
        }),
        el(TextControl, {
          key: "promise",
          label: "Promesse de réponse",
          value: props.attributes.promise,
          onChange: function (value) { props.setAttributes({ promise: value }); },
        }),
        el(TextControl, {
          key: "phone",
          label: "Téléphone affiché",
          value: props.attributes.phone,
          onChange: function (value) { props.setAttributes({ phone: value }); },
        }),
      ]);
    },
    save: function () {
      return null;
    },
  });
})(window.wp.blocks, window.wp.element, window.wp.components);
