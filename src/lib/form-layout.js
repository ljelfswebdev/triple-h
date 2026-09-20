export function layoutColumns(value) {
  const columns = Number(value);
  return columns === 2 || columns === 3 ? columns : 1;
}

export function groupFormFields(fields = []) {
  const rows = [];

  for (const field of fields) {
    const rowKey = typeof field.layoutRow === "string" ? field.layoutRow : "";
    const current = rows.at(-1);

    if (rowKey) {
      if (current?.key === rowKey) {
        current.fields.push(field);
      } else {
        rows.push({
          key: rowKey,
          columns: layoutColumns(field.layoutColumns),
          fields: [field],
        });
      }
      continue;
    }

    // Legacy forms used consecutive half-width fields instead of explicit rows.
    if (
      field.width === "half" &&
      current?.legacyHalf &&
      current.fields.length < 2
    ) {
      current.fields.push(field);
    } else {
      rows.push({
        key: `legacy-row-${rows.length + 1}`,
        columns: field.width === "half" ? 2 : 1,
        fields: [field],
        legacyHalf: field.width === "half",
      });
    }
  }

  return rows.map(({ legacyHalf: _legacyHalf, ...row }) => row);
}
