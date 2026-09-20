"use client";

import { createFieldDefaults } from "@/lib/page-definitions";
import { groupFormFields, layoutColumns } from "@/lib/form-layout";
import FieldRenderer from "./FieldRenderer";
import SortableRepeater from "./SortableRepeater";

function createKey() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `form-row-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function createField(definition) {
  return { ...createFieldDefaults(definition), _key: createKey() };
}

function editableRows(fields) {
  return groupFormFields(fields).map((row) => ({
    ...row,
    _key: row.key,
    columns: Math.min(3, Math.max(row.columns, row.fields.length)),
  }));
}

export default function FormFieldsEditor({ definition, fields, onChange }) {
  const rows = editableRows(fields);

  function updateRows(nextRows) {
    onChange(
      nextRows.flatMap((row) => {
        const columns = layoutColumns(row.columns);
        const rowKey = row._key || createKey();
        return row.fields.slice(0, columns).map((field) => {
          const { helpText: _helpText, width: _width, ...cleanField } = field;
          return {
            ...cleanField,
            layoutRow: rowKey,
            layoutColumns: columns,
          };
        });
      }),
    );
  }

  function updateColumns(row, nextColumns, updateRow) {
    const columns = layoutColumns(nextColumns);
    const nextFields = [...row.fields];
    while (nextFields.length < columns) nextFields.push(createField(definition));
    updateRow({ ...row, columns, fields: nextFields.slice(0, columns) });
  }

  return (
    <div className="admin-form-layout">
      <SortableRepeater
        addLabel="Add row"
        createItem={() => ({
          columns: 1,
          fields: [createField(definition)],
        })}
        itemLabel="Row"
        items={rows}
        label="Form rows"
        onChange={updateRows}
        renderItem={(row, rowIndex, updateRow) => (
          <>
            <fieldset className="admin-form-layout__choice">
              <legend>Items in row</legend>
              <div className="admin-form-layout__choice-options">
                {[1, 2, 3].map((count) => (
                  <label key={count}>
                    <input
                      checked={row.columns === count}
                      name={`form-row-${row._key || rowIndex}-columns`}
                      onChange={() => updateColumns(row, count, updateRow)}
                      type="radio"
                      value={count}
                    />
                    <span>{count}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div
              className={`admin-form-layout__fields admin-form-layout__fields--${row.columns}`}
            >
              {row.fields.slice(0, row.columns).map((field, fieldIndex) => (
                <section
                  className="admin-form-layout__field"
                  key={field._id || field._key || fieldIndex}
                >
                  <span className="admin-form-layout__field-number">
                    Field {fieldIndex + 1}
                  </span>
                  <FieldRenderer
                    fields={definition}
                    idPrefix={`form-row-${rowIndex}-field-${fieldIndex}`}
                    onChange={(nextField) =>
                      updateRow({
                        ...row,
                        fields: row.fields.map((item, index) =>
                          index === fieldIndex ? nextField : item,
                        ),
                      })
                    }
                    value={field}
                  />
                </section>
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
}
