"use client";

import { useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPageBuilderBlock, PAGE_BUILDER_TYPES } from "@/lib/page-builder";
import MediaField from "./MediaField";
import RichTextEditor from "./RichTextEditor";
import Select from "./Select";

const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Triple H red", value: "red" },
];
const widthOptions = [
  { label: "Standard", value: "standard" },
  { label: "Wide", value: "wide" },
];

function blockId() {
  return globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function BlockFields({ block, onChange }) {
  const update = (key, value) => onChange({ ...block, [key]: value });
  const headingFields = (
    <div className="admin-post-editor__two-column">
      <div className="field"><label>Eyebrow</label><input onChange={(event) => update("eyebrow", event.target.value)} placeholder="e.g. Behind the work" value={block.eyebrow || ""} /></div>
      <div className="field"><label>Heading</label><input onChange={(event) => update("title", event.target.value)} placeholder="Add a section heading" value={block.title || ""} /></div>
    </div>
  );

  if (block.type === "content") return <>
    {headingFields}
    <div className="field"><label>Section style</label><Select isSearchable={false} onChange={(option) => update("theme", option?.value || "light")} options={themeOptions} placeholder="Choose a style" value={themeOptions.find((option) => option.value === (block.theme || "light"))} /></div>
    <div className="field admin-field"><label>Content</label><RichTextEditor label="Page builder text content" onChange={(value) => update("body", value)} value={block.body || ""} /></div>
  </>;

  if (block.type === "ticks") return <>
    {headingFields}
    <div className="field"><label>Section style</label><Select isSearchable={false} onChange={(option) => update("theme", option?.value || "dark")} options={themeOptions} placeholder="Choose a style" value={themeOptions.find((option) => option.value === (block.theme || "dark"))} /></div>
    <div className="field"><label>Tick-list items</label><textarea onChange={(event) => update("items", event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} placeholder="Add one point per line" rows="7" value={(block.items || []).join("\n")} /></div>
  </>;

  if (block.type === "image") return <>
    <MediaField accept="image" label="Feature image" onChange={(media) => update("image", media)} value={block.image || null} />
    <div className="admin-post-editor__two-column">
      <div className="field"><label>Caption</label><input onChange={(event) => update("caption", event.target.value)} placeholder="Optional image caption" value={block.caption || ""} /></div>
      <div className="field"><label>Image width</label><Select isSearchable={false} onChange={(option) => update("layout", option?.value || "wide")} options={widthOptions} placeholder="Choose image width" value={widthOptions.find((option) => option.value === (block.layout || "wide"))} /></div>
    </div>
  </>;

  if (block.type === "gallery") return <>
    {headingFields}
    <label className="admin-checkbox"><input checked={block.autoplay !== false} onChange={(event) => update("autoplay", event.target.checked)} type="checkbox" /><span>Auto-play slider</span></label>
    <div className="page-builder-admin__gallery">
      {(block.images || []).map((image, index) => <div className="page-builder-admin__gallery-item" key={`${block.id}-image-${index}`}>
        <MediaField accept="image" label={`Slide ${index + 1}`} onChange={(media) => update("images", (block.images || []).map((item, itemIndex) => itemIndex === index ? media : item).filter(Boolean))} value={image} />
        <button className="btn btn-black-outline btn-small" onClick={() => update("images", block.images.filter((_, itemIndex) => itemIndex !== index))} type="button">Remove slide</button>
      </div>)}
    </div>
    <button className="btn btn-black-outline btn-small" onClick={() => update("images", [...(block.images || []), null])} type="button">Add image</button>
  </>;

  if (block.type === "video") return <>
    <MediaField accept="video" label="Video" onChange={(media) => update("video", media)} value={block.video || null} />
    <MediaField accept="image" label="Poster image" onChange={(media) => update("poster", media)} value={block.poster || null} />
    <div className="admin-post-editor__two-column">
      <div className="field"><label>Caption</label><input onChange={(event) => update("caption", event.target.value)} placeholder="Optional video caption" value={block.caption || ""} /></div>
      <div className="field"><label>Video width</label><Select isSearchable={false} onChange={(option) => update("layout", option?.value || "wide")} options={widthOptions} placeholder="Choose video width" value={widthOptions.find((option) => option.value === (block.layout || "wide"))} /></div>
    </div>
    <div className="page-builder-admin__video-options">
      <label className="admin-checkbox"><input checked={Boolean(block.autoplay)} onChange={(event) => update("autoplay", event.target.checked)} type="checkbox" /><span>Auto-play muted</span></label>
      <label className="admin-checkbox"><input checked={block.controls !== false} onChange={(event) => update("controls", event.target.checked)} type="checkbox" /><span>Show player controls</span></label>
      <label className="admin-checkbox"><input checked={Boolean(block.loop)} onChange={(event) => update("loop", event.target.checked)} type="checkbox" /><span>Loop video</span></label>
      <label className="admin-checkbox"><input checked={Boolean(block.muted)} disabled={Boolean(block.autoplay)} onChange={(event) => update("muted", event.target.checked)} type="checkbox" /><span>Mute video</span></label>
    </div>
    {block.autoplay ? <p className="admin-field-note">Auto-playing video is muted automatically so it works reliably on mobile and desktop browsers.</p> : null}
  </>;

  if (block.type === "quote") return <>
    <div className="field"><label>Statement or quote</label><textarea onChange={(event) => update("quote", event.target.value)} placeholder="Add a memorable statement" rows="5" value={block.quote || ""} /></div>
    <div className="admin-post-editor__two-column">
      <div className="field"><label>Attribution</label><input onChange={(event) => update("attribution", event.target.value)} placeholder="Optional person or source" value={block.attribution || ""} /></div>
      <div className="field"><label>Section style</label><Select isSearchable={false} onChange={(option) => update("theme", option?.value || "red")} options={themeOptions} placeholder="Choose a style" value={themeOptions.find((option) => option.value === (block.theme || "red"))} /></div>
    </div>
  </>;

  if (block.type === "stats") return <>
    {headingFields}
    <div className="page-builder-admin__stats">
      {(block.items || []).map((item, index) => <div className="admin-post-editor__two-column" key={`${block.id}-stat-${index}`}>
        <div className="field"><label>Value</label><input onChange={(event) => update("items", block.items.map((current, itemIndex) => itemIndex === index ? { ...current, value: event.target.value } : current))} placeholder="e.g. 24/7" value={item.value || ""} /></div>
        <div className="field"><label>Label</label><input onChange={(event) => update("items", block.items.map((current, itemIndex) => itemIndex === index ? { ...current, label: event.target.value } : current))} placeholder="Describe the result" value={item.label || ""} /></div>
        <button className="btn btn-black-outline btn-small" onClick={() => update("items", block.items.filter((_, itemIndex) => itemIndex !== index))} type="button">Remove statistic</button>
      </div>)}
    </div>
    <button className="btn btn-black-outline btn-small" onClick={() => update("items", [...(block.items || []), { value: "", label: "" }])} type="button">Add statistic</button>
  </>;

  if (block.type === "cta") return <>
    {headingFields}
    <div className="field"><label>Supporting text</label><textarea onChange={(event) => update("text", event.target.value)} placeholder="Give people a reason to take the next step" rows="4" value={block.text || ""} /></div>
    <div className="admin-post-editor__two-column">
      <div className="field"><label>Button label</label><input onChange={(event) => update("link", { ...block.link, label: event.target.value })} placeholder="e.g. Contact us" value={block.link?.label || ""} /></div>
      <div className="field"><label>Button destination</label><input onChange={(event) => update("link", { ...block.link, url: event.target.value })} placeholder="/contact or https://…" value={block.link?.url || ""} /></div>
    </div>
    <div className="admin-post-editor__two-column">
      <div className="field"><label>Section style</label><Select isSearchable={false} onChange={(option) => update("theme", option?.value || "dark")} options={themeOptions} placeholder="Choose a style" value={themeOptions.find((option) => option.value === (block.theme || "dark"))} /></div>
      <label className="admin-checkbox"><input checked={Boolean(block.link?.newTab)} onChange={(event) => update("link", { ...block.link, newTab: event.target.checked })} type="checkbox" /><span>Open button in a new tab</span></label>
    </div>
  </>;

  if (block.type === "enquiry") return <>
    {headingFields}
    <div className="field"><label>Supporting text</label><textarea onChange={(event) => update("text", event.target.value)} placeholder="Add a short introduction" rows="4" value={block.text || ""} /></div>
  </>;

  return null;
}

function SortableBlock({ block, index, onChange, onDuplicate, onRemove }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const label = PAGE_BUILDER_TYPES.find((item) => item.value === block.type)?.label || block.type;
  return <article className={`page-builder-admin__block${isDragging ? " is-dragging" : ""}`} ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
    <header>
      <button aria-label={`Move ${label} block`} className="page-builder-admin__drag" type="button" {...attributes} {...listeners}><span>{String(index + 1).padStart(2, "0")}</span> ⋮⋮</button>
      <strong>{label}</strong>
      <div><button className="btn btn-black-outline btn-small" onClick={onDuplicate} type="button">Duplicate</button><button className="btn btn-black-outline btn-small" onClick={onRemove} type="button">Remove</button></div>
    </header>
    <div className="page-builder-admin__fields"><BlockFields block={block} onChange={onChange} /></div>
  </article>;
}

export default function PageBuilderEditor({ blocks = [], enabled, onChange, onEnabledChange }) {
  const [newType, setNewType] = useState(PAGE_BUILDER_TYPES[0]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  function addBlock() {
    onChange([...blocks, createPageBuilderBlock(newType.value, blockId())]);
  }

  function reorder({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0) onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  return <fieldset className="admin-group page-builder-admin">
    <legend>Page builder</legend>
    <div className="page-builder-admin__mode">
      <div><strong>{enabled ? "Custom page builder enabled" : "Default detail-page layout"}</strong><p>{enabled ? "The banner is followed by the blocks below, in this order." : "Turn this on when you want to replace the standard content layout with custom blocks."}</p></div>
      <label className="admin-switch"><input checked={enabled} onChange={(event) => onEnabledChange(event.target.checked)} type="checkbox" /><span aria-hidden="true" /><b>{enabled ? "Builder on" : "Use default"}</b></label>
    </div>
    {enabled ? <>
      <div className="page-builder-admin__add">
        <div className="field"><label>Add a component</label><Select isSearchable={false} onChange={(option) => setNewType(option || PAGE_BUILDER_TYPES[0])} options={PAGE_BUILDER_TYPES} placeholder="Choose a component" value={newType} /></div>
        <button className="btn btn-primary" onClick={addBlock} type="button">Add component</button>
      </div>
      {blocks.length ? <DndContext collisionDetection={closestCenter} onDragEnd={reorder} sensors={sensors}><SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}><div className="page-builder-admin__blocks">{blocks.map((block, index) => <SortableBlock block={block} index={index} key={block.id} onChange={(nextBlock) => onChange(blocks.map((item) => item.id === block.id ? nextBlock : item))} onDuplicate={() => onChange([...blocks.slice(0, index + 1), { ...structuredClone(block), id: blockId() }, ...blocks.slice(index + 1)])} onRemove={() => onChange(blocks.filter((item) => item.id !== block.id))} />)}</div></SortableContext></DndContext> : <p className="admin-empty-value">No components yet. Add one above to start building the page.</p>}
    </> : null}
  </fieldset>;
}
