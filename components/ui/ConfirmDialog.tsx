"use client";

import { Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;

  icon?: React.ReactNode;
  iconBg?: string;

  title: string;
  subtitle?: string;
  description?: string;

  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  confirmHoverColor?: string;
  loadingLabel?: string;

  position?: "center" | "bottom";
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
  icon,
  iconBg = "#E8EFEA",
  title,
  subtitle,
  description,
  confirmLabel = "Ya, Konfirmasi",
  cancelLabel = "Batal",
  confirmColor = "#6B8F71",
  confirmHoverColor = "#5a7b5f",
  loadingLabel = "Menyimpan...",
  position = "bottom",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const positionClass =
    position === "bottom"
      ? "items-end sm:items-center"
      : "items-center";

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center p-4 ${positionClass}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-desc" : undefined}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => !isLoading && onCancel()}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 flex flex-col gap-4 z-10 animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: iconBg }}
            >
              {icon}
            </div>
          )}
          <div>
            <p id="confirm-dialog-title" className="font-bold text-gray-800 text-sm">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {description && (
          <p id="confirm-dialog-desc" className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
        )}

        <div className="flex gap-2.5 mt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 min-h-[44px] rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer select-none disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              backgroundColor: confirmColor,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = confirmHoverColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = confirmColor)
            }
            className="flex-1 min-h-[44px] rounded-xl text-white font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer select-none disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingLabel}</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
