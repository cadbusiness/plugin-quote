(function (blocks, element, components) {
  var el = element.createElement;
  var TextControl = components.TextControl;

  blocks.registerBlockType("quotebuilder/embed", {
    title: "QuoteBuilder",
    icon: "feedback",
    category: "widgets",
    attributes: {
      org: { type: "string", default: "quickly" },
      id: { type: "string", default: "rayonnage" },
      height: { type: "string", default: "720px" },
    },
    edit: function (props) {
      return el("div", { className: "quotebuilder-block-editor" }, [
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
          label: "Configurateur",
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
})(window.wp.blocks, window.wp.element, window.wp.components);
