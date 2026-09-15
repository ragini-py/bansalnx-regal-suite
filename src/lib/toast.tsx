/**
 * Toast notifications — backed by react-toastify. Every call site across the
 * app was written against sonner's `toast.success(title, { description })` /
 * `toast.error(title, { description })` shape; this wrapper keeps that exact
 * signature (so no call site needed to change) while rendering through
 * react-toastify underneath. Import `toast` from here, never directly from
 * "react-toastify", so the whole app stays on one consistent toast shape.
 */
import { toast as reactToastify, type ToastOptions } from "react-toastify";

export interface AppToastOptions {
  description?: string;
}

function render(title: string, description?: string) {
  if (!description) return title;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-sm font-semibold leading-tight">{title}</p>
      <p className="text-xs leading-snug opacity-80">{description}</p>
    </div>
  );
}

const baseOptions: ToastOptions = {
  position: "bottom-right",
};

export const toast = {
  success(title: string, options?: AppToastOptions) {
    return reactToastify.success(render(title, options?.description), baseOptions);
  },
  error(title: string, options?: AppToastOptions) {
    return reactToastify.error(render(title, options?.description), baseOptions);
  },
};
