import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
    icon?: ReactNode;
    iconPosition?: string;
    fullWidth?: boolean;
    align?: string;
  },
): ReactNode;
export function Field(
  props: InputHTMLAttributes<HTMLInputElement> & {
    label: ReactNode;
    hint?: ReactNode;
    options?: { value: string; label: string }[];
  },
): ReactNode;
export function Badge(props: {
  children?: ReactNode;
  tone?: string;
}): ReactNode;
export function Toolbar(props: {
  title: string;
  children?: ReactNode;
}): ReactNode;
export function DatabaseShell<T extends string>(props: {
  as?: "main" | "div" | "section";
  title: string;
  description?: string;
  brand?: ReactNode;
  sections?: { id: T; title: string; description?: string; icon?: ReactNode }[];
  selected?: T;
  onSelect?: (id: T) => void;
  headerActions?: ReactNode;
  children?: ReactNode;
}): ReactNode;
export function DataTable<T, K extends keyof T>(props: {
  rows: T[];
  columns: {
    key: K;
    label: string;
    sortable?: boolean;
    render?: (value: T[K], row: T) => ReactNode;
  }[];
  getRowId?: (row: T) => string;
  sort?: { key: K; direction: "asc" | "desc" };
  onSortChange?: (sort: { key: K; direction: "asc" | "desc" }) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  actions?: (row: T) => ReactNode;
  loading?: boolean;
  error?: string;
  caption?: string;
  emptyMessage?: string;
}): ReactNode;
export { ActionGroup } from "./layout/ActionGroup.jsx";
export { Modal } from "./overlays/Modal.jsx";
export { RecordForm } from "./forms/RecordForm.jsx";
