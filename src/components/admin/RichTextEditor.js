"use client";

import { useEffect, useId, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { TableKit } from "@tiptap/extension-table";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";

const TEXT_COLOURS = [
  { label: "Black", value: "#222222" },
  { label: "Orange", value: "#ff914d" },
  { label: "Teal", value: "#087d82" },
  { label: "Red", value: "#b42318" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Green", value: "#15803d" },
  { label: "Purple", value: "#7e22ce" },
];

function editorHtml(editor) {
  const html = editor.getHTML();
  return html === "<p></p>" ? "" : html;
}

function ToolbarButton({ active = false, children, disabled = false, onClick }) {
  return (
    <button
      aria-pressed={active}
      className="rich-text-editor__button"
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      type="button"
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ label, onChange, value = "" }) {
  const editorId = useId();
  const [colourPopoverOpen, setColourPopoverOpen] = useState(false);
  const [customColour, setCustomColour] = useState("#ff914d");
  const [linkHref, setLinkHref] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [mode, setMode] = useState("visual");
  const [source, setSource] = useState(value);
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false);
  const onChangeRef = useRef(onChange);
  const sourceRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          autolink: true,
          defaultProtocol: "https",
          openOnClick: false,
        },
      }),
      TextStyle,
      Color,
      TableKit,
    ],
    content: value,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        "aria-label": label,
        class: "rich-text-editor__content",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const html = editorHtml(currentEditor);
      sourceRef.current = html;
      setSource(html);
      onChangeRef.current(html);
    },
  });

  useEffect(() => {
    if (!editor) return;

    const nextValue = value || "";
    if (sourceRef.current !== nextValue) {
      sourceRef.current = nextValue;
      setSource(nextValue);
    }

    const currentValue = editorHtml(editor);
    if (currentValue !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  function closePopovers() {
    setColourPopoverOpen(false);
    setLinkPopoverOpen(false);
    setTablePopoverOpen(false);
  }

  function openLinkPopover() {
    const attributes = editor.getAttributes("link");
    setLinkHref(attributes.href || "");
    setLinkNewTab(attributes.target === "_blank");
    setColourPopoverOpen(false);
    setTablePopoverOpen(false);
    setLinkPopoverOpen(true);
  }

  function openColourPopover() {
    const currentColour = editor.getAttributes("textStyle").color;
    if (currentColour) setCustomColour(currentColour);
    setLinkPopoverOpen(false);
    setTablePopoverOpen(false);
    setColourPopoverOpen(true);
  }

  function openTablePopover() {
    setColourPopoverOpen(false);
    setLinkPopoverOpen(false);
    setTablePopoverOpen(true);
  }

  function applyLink(event) {
    event.preventDefault();
    const href = linkHref.trim();
    if (!href) return;

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href,
        rel: linkNewTab ? "noopener noreferrer" : null,
        target: linkNewTab ? "_blank" : null,
      })
      .run();
    setLinkPopoverOpen(false);
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkPopoverOpen(false);
  }

  function updateSource(nextSource) {
    sourceRef.current = nextSource;
    setSource(nextSource);
    onChangeRef.current(nextSource);
  }

  function showVisualEditor() {
    editor.commands.setContent(source || "", { emitUpdate: false });
    const normalisedHtml = editorHtml(editor);

    if (normalisedHtml !== source) updateSource(normalisedHtml);
    closePopovers();
    setMode("visual");
  }

  return (
    <div className="rich-text-editor">
      <div aria-label={`${label} editor mode`} className="rich-text-editor__modes" role="tablist">
        <button
          aria-controls={`${editorId}-visual`}
          aria-selected={mode === "visual"}
          className="rich-text-editor__mode"
          onClick={showVisualEditor}
          role="tab"
          type="button"
        >
          Visual
        </button>
        <button
          aria-controls={`${editorId}-html`}
          aria-selected={mode === "html"}
          className="rich-text-editor__mode"
          onClick={() => {
            closePopovers();
            setMode("html");
          }}
          role="tab"
          type="button"
        >
          HTML
        </button>
      </div>

      {mode === "visual" ? (
        <div id={`${editorId}-visual`} role="tabpanel">
          <div aria-label={`${label} formatting`} className="rich-text-editor__toolbar">
            <ToolbarButton
              active={editor.isActive("paragraph")}
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              Paragraph
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              Bold
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              Italic
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              Underline
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              Strike
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("heading", { level: 1 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("heading", { level: 3 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H3
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("heading", { level: 4 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            >
              H4
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("heading", { level: 5 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
            >
              H5
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              Bullets
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              Numbered
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("table") || tablePopoverOpen}
              onClick={openTablePopover}
            >
              Table
            </ToolbarButton>
            {tablePopoverOpen ? (
              <div aria-label="Table controls" className="rich-text-editor__popover" role="dialog">
                <strong>{editor.isActive("table") ? "Edit table" : "Insert table"}</strong>
                {editor.isActive("table") ? (
                  <div className="rich-text-editor__popover-actions">
                    <button
                      className="btn btn-black-outline btn-small"
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                      type="button"
                    >
                      Add row
                    </button>
                    <button
                      className="btn btn-black-outline btn-small"
                      onClick={() => editor.chain().focus().addColumnAfter().run()}
                      type="button"
                    >
                      Add column
                    </button>
                    <button
                      className="btn btn-black-outline btn-small"
                      onClick={() => editor.chain().focus().deleteRow().run()}
                      type="button"
                    >
                      Delete row
                    </button>
                    <button
                      className="btn btn-black-outline btn-small"
                      onClick={() => editor.chain().focus().deleteColumn().run()}
                      type="button"
                    >
                      Delete column
                    </button>
                    <button
                      className="btn btn-primary btn-small"
                      onClick={() => {
                        editor.chain().focus().deleteTable().run();
                        setTablePopoverOpen(false);
                      }}
                      type="button"
                    >
                      Delete table
                    </button>
                  </div>
                ) : (
                  <div className="rich-text-editor__popover-actions">
                    {[
                      [2, 2],
                      [3, 3],
                      [4, 4],
                    ].map(([rows, cols]) => (
                      <button
                        className="btn btn-black-outline btn-small"
                        key={`${rows}-${cols}`}
                        onClick={() => {
                          editor
                            .chain()
                            .focus()
                            .insertTable({ rows, cols, withHeaderRow: true })
                            .run();
                          setTablePopoverOpen(false);
                        }}
                        type="button"
                      >
                        {rows} × {cols}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  className="rich-text-editor__link-cancel"
                  onClick={() => setTablePopoverOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </div>
            ) : null}
            <ToolbarButton
              active={Boolean(editor.getAttributes("textStyle").color) || colourPopoverOpen}
              onClick={openColourPopover}
            >
              Colour
            </ToolbarButton>
            {colourPopoverOpen ? (
              <div aria-label="Text colour" className="rich-text-editor__popover" role="dialog">
                <strong>Text colour</strong>
                <div className="rich-text-editor__colour-grid">
                  {TEXT_COLOURS.map((colour) => (
                    <button
                      aria-label={colour.label}
                      className="rich-text-editor__colour-swatch"
                      key={colour.value}
                      onClick={() => {
                        editor.chain().focus().setColor(colour.value).run();
                        setCustomColour(colour.value);
                        setColourPopoverOpen(false);
                      }}
                      style={{ backgroundColor: colour.value }}
                      type="button"
                    />
                  ))}
                </div>
                <label className="rich-text-editor__custom-colour">
                  <span>Custom colour</span>
                  <input
                    onChange={(event) => {
                      setCustomColour(event.target.value);
                      editor.chain().focus().setColor(event.target.value).run();
                    }}
                    type="color"
                    value={customColour}
                  />
                </label>
                <div className="rich-text-editor__popover-actions">
                  <button
                    className="btn btn-black-outline btn-small"
                    onClick={() => {
                      editor.chain().focus().unsetColor().run();
                      setColourPopoverOpen(false);
                    }}
                    type="button"
                  >
                    Reset colour
                  </button>
                  <button
                    className="rich-text-editor__link-cancel"
                    onClick={() => setColourPopoverOpen(false)}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
            <ToolbarButton
              active={editor.isActive("link") || linkPopoverOpen}
              onClick={openLinkPopover}
            >
              Link
            </ToolbarButton>
            {linkPopoverOpen ? (
              <form
                aria-label="Edit link"
                className="rich-text-editor__link-popover"
                onKeyDown={(event) => {
                  if (event.key === "Escape") setLinkPopoverOpen(false);
                }}
                onSubmit={applyLink}
              >
                <label htmlFor={`${editorId}-link-url`}>Link URL</label>
                <input
                  autoFocus
                  id={`${editorId}-link-url`}
                  onChange={(event) => setLinkHref(event.target.value)}
                  placeholder="https://example.com"
                  required
                  type="text"
                  value={linkHref}
                />
                <label className="rich-text-editor__link-checkbox">
                  <input
                    checked={linkNewTab}
                    onChange={(event) => setLinkNewTab(event.target.checked)}
                    type="checkbox"
                  />
                  <span>Open in a new tab</span>
                </label>
                <div className="rich-text-editor__link-actions">
                  <button className="btn btn-primary btn-small" type="submit">
                    {editor.isActive("link") ? "Update link" : "Add link"}
                  </button>
                  {editor.isActive("link") ? (
                    <button
                      className="btn btn-black-outline btn-small"
                      onClick={removeLink}
                      type="button"
                    >
                      Remove
                    </button>
                  ) : null}
                  <button
                    className="rich-text-editor__link-cancel"
                    onClick={() => setLinkPopoverOpen(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
            <ToolbarButton
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              Quote
            </ToolbarButton>
            <ToolbarButton
              active={editor.isActive("code")}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              Inline code
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            >
              Clear
            </ToolbarButton>
            <ToolbarButton
              disabled={!editor.can().chain().focus().undo().run()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              Undo
            </ToolbarButton>
            <ToolbarButton
              disabled={!editor.can().chain().focus().redo().run()}
              onClick={() => editor.chain().focus().redo().run()}
            >
              Redo
            </ToolbarButton>
          </div>
          <EditorContent editor={editor} />
        </div>
      ) : (
        <div id={`${editorId}-html`} role="tabpanel">
          <textarea
            aria-label={`${label} HTML source`}
            className="rich-text-editor__source"
            onChange={(event) => updateSource(event.target.value)}
            placeholder="Enter HTML source"
            spellCheck={false}
            value={source}
          />
        </div>
      )}
    </div>
  );
}
