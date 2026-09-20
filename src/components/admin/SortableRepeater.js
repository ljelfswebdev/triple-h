"use client";

import { useEffect } from "react";
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

function createKey() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `item-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function itemKey(item, index) {
  return String(item?._id || item?._key || `repeater-item-${index}`);
}

function SortableItem({ children, id, index, itemLabel, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      className="admin-repeater__item"
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.7 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="admin-repeater__item-header">
        <button
          aria-label={`Drag ${itemLabel.toLowerCase()} ${index + 1}`}
          className="admin-repeater__drag"
          type="button"
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true">⋮⋮</span>
          <span>{itemLabel} {index + 1}</span>
        </button>
        <button
          className="btn btn-black-outline btn-small"
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
      </div>
      {children}
    </div>
  );
}

export default function SortableRepeater({
  addLabel = "Add item",
  createItem,
  itemLabel = "Item",
  items = [],
  label,
  onChange,
  renderItem,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (items.some((item) => !item?._id && !item?._key)) {
      onChange(
        items.map((item) =>
          item?._id || item?._key ? item : { ...item, _key: createKey() },
        ),
      );
    }
  }, [items, onChange]);

  const ids = items.map(itemKey);

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(items, oldIndex, newIndex));
    }
  }

  function addItem() {
    onChange([...items, { ...createItem(), _key: createKey() }]);
  }

  return (
    <div className="admin-repeater">
      <div className="admin-repeater__header">
        <span className="admin-field__label">{label}</span>
        <button
          className="btn btn-primary-outline btn-small"
          onClick={addItem}
          type="button"
        >
          {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <p className="admin-empty-value">No items added yet.</p>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="admin-repeater__items">
              {items.map((item, index) => {
                const id = itemKey(item, index);

                return (
                  <SortableItem
                    id={id}
                    index={index}
                    itemLabel={itemLabel}
                    key={id}
                    onRemove={() =>
                      onChange(
                        items.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    {renderItem(item, index, (nextItem) => {
                      onChange(
                        items.map((currentItem, itemIndex) =>
                          itemIndex === index ? nextItem : currentItem,
                        ),
                      );
                    })}
                  </SortableItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {items.length > 0 ? (
        <div className="admin-repeater__footer">
          <button
            className="btn btn-primary-outline btn-small"
            onClick={addItem}
            type="button"
          >
            {addLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
