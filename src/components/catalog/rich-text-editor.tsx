"use client";

import { useRef } from "react";
import { uploadDescriptionImage } from "@/app/(app)/produits/actions";
import { looksLikeHtml, sanitizeProductHtml } from "@/lib/catalog/html";

export function RichTextEditor({
  name,
  defaultValue,
  productId,
}: {
  name: string;
  defaultValue: string | null;
  productId?: string;
}) {
  const htmlRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const initial = looksLikeHtml(defaultValue) ? sanitizeProductHtml(defaultValue) : (defaultValue ?? "");

  function sync() {
    if (htmlRef.current && editorRef.current) {
      htmlRef.current.value = editorRef.current.innerHTML;
    }
  }

  function command(cmd: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    sync();
  }

  function addLink() {
    const href = window.prompt("Adresse du lien", "https://");
    if (href) command("createLink", href);
  }

  async function addImage(file: File) {
    if (!productId) return;
    const body = new FormData();
    body.set("image", file);
    const data = await uploadDescriptionImage(productId, body);
    if (data.url) command("insertImage", data.url);
  }

  return (
    <div>
      <input ref={htmlRef} type="hidden" name={name} defaultValue={initial} />
      <div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-slate-200 bg-slate-50 px-2 py-1.5">
        <Mark onClick={() => command("bold")} label="Gras">
          G
        </Mark>
        <Mark onClick={() => command("italic")} label="Italique">
          <span className="italic">I</span>
        </Mark>
        <Mark onClick={() => command("underline")} label="Souligné">
          <span className="underline">S</span>
        </Mark>
        <Mark onClick={() => command("insertUnorderedList")} label="Liste">
          •
        </Mark>
        <Mark onClick={addLink} label="Lien">
          Lien
        </Mark>
        {productId ? (
          <>
            <Mark onClick={() => fileRef.current?.click()} label="Image">
              Image
            </Mark>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void addImage(file);
                event.target.value = "";
              }}
            />
          </>
        ) : null}
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-label="Description"
        suppressContentEditableWarning
        onInput={sync}
        onBlur={sync}
        className="min-h-36 rounded-b-md border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-800 outline-none focus:ring-2 focus:ring-orange-200 [&_a]:text-[#C2410C] [&_img]:max-h-40 [&_img]:rounded-md [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{ __html: initial }}
      />
    </div>
  );
}

function Mark({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      aria-label={label}
      className="rounded px-2 py-1 text-xs font-medium text-slate-600 hover:bg-white hover:text-slate-900"
    >
      {children}
    </button>
  );
}
