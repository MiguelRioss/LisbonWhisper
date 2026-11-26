import "./DataTable.css";
import { useEffect, useRef } from "react";
import { ActionGroup } from "../layout/ActionGroup.jsx";
import { Button } from "../actions/Button.jsx";
export function DataTable({
  rows,
  columns,
  getRowId = (row) => row.id,
  sort,
  onSortChange,
  selectedIds,
  onSelectionChange,
  actions,
  loading = false,
  error,
  caption = "Records",
  emptyMessage = "No records found.",
}) {
  const ids = rows.map(getRowId);
  const allSelected = ids.length > 0 && ids.every((id) => selectedIds?.has(id));
  const partial = !allSelected && ids.some((id) => selectedIds?.has(id));
  const selectAll = useRef(null);
  useEffect(() => {
    if (selectAll.current) selectAll.current.indeterminate = partial;
  }, [partial]);
  function toggle(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }
  const span = columns.length + (onSelectionChange ? 1 : 0) + (actions ? 1 : 0);
  return (
    <div className="db-card db-table-wrap">
      <table className="db-table">
        <caption className="db-sr-only">{caption}</caption>
        <thead>
          <tr>
            {onSelectionChange && (
              <th>
                <input
                  ref={selectAll}
                  type="checkbox"
                  aria-label="Select all visible records"
                  checked={allSelected}
                  disabled={!ids.length || loading || !!error}
                  onChange={() => {
                    const next = new Set(selectedIds);
                    ids.forEach((id) =>
                      allSelected ? next.delete(id) : next.add(id),
                    );
                    onSelectionChange(next);
                  }}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                aria-sort={
                  sort?.key === column.key
                    ? sort.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
              >
                {column.sortable && onSortChange ? (
                  <Button
                    className="db-sort"
                    onClick={() =>
                      onSortChange({
                        key: column.key,
                        direction:
                          sort?.key === column.key && sort.direction === "asc"
                            ? "desc"
                            : "asc",
                      })
                    }
                  >
                    {column.label}
                    {sort?.key === column.key
                      ? sort.direction === "asc"
                        ? " ↑"
                        : " ↓"
                      : " ↕"}
                  </Button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading || error || !rows.length ? (
            <tr>
              <td colSpan={span}>
                <div role={error ? "alert" : "status"}>
                  {error || (loading ? "Loading…" : emptyMessage)}
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowId(row)}>
                {onSelectionChange && (
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select record ${getRowId(row)}`}
                      checked={selectedIds?.has(getRowId(row)) || false}
                      onChange={() => toggle(getRowId(row))}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "—")}
                  </td>
                ))}
                {actions && (
                  <td>
                    <ActionGroup>{actions(row)}</ActionGroup>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
