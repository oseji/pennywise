"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type AccessibleDialogProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	titleId?: string;
	/** "center" (default) is a centred modal; "sheet" slides up from the bottom edge. */
	variant?: "center" | "sheet";
	className?: string;
};

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AccessibleDialog({
	open,
	onClose,
	title,
	children,
	titleId = "accessible-dialog-title",
	variant = "center",
	className = "",
}: AccessibleDialogProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	// element that had focus before the dialog opened; restored on close
	const triggerRef = useRef<HTMLElement | null>(null);

	// Escape closes; Tab / Shift+Tab cycle inside the panel; body scroll locked.
	useEffect(() => {
		if (!open) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
				return;
			}
			if (e.key !== "Tab" || !panelRef.current) return;

			const focusable = Array.from(
				panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
			);
			if (focusable.length === 0) {
				e.preventDefault();
				panelRef.current.focus();
				return;
			}
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement as HTMLElement | null;

			if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && (active === last || !panelRef.current.contains(active))) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = prevOverflow;
		};
	}, [open, onClose]);

	// Initial focus goes to the first field (not the close button); focus
	// returns to whatever opened the dialog when it closes.
	useEffect(() => {
		if (!open) return;
		triggerRef.current = document.activeElement as HTMLElement | null;

		const t = window.setTimeout(() => {
			const panel = panelRef.current;
			if (!panel) return;
			const field = panel.querySelector<HTMLElement>(
				'input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
			);
			const firstAction = Array.from(
				panel.querySelectorAll<HTMLElement>(FOCUSABLE)
			).find((el) => el.dataset.dialogClose === undefined);
			(field ?? firstAction ?? panel).focus();
		}, 0);

		return () => {
			clearTimeout(t);
			const trigger = triggerRef.current;
			if (trigger && trigger.isConnected) trigger.focus();
		};
	}, [open]);

	if (!open) return null;

	const isSheet = variant === "sheet";

	return (
		<div
			className={`fixed inset-0 z-50 flex justify-center ${
				isSheet ? "items-end" : "items-center p-4"
			} ${className}`}
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				aria-hidden="true"
				onClick={onClose}
			/>

			{/* Panel */}
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
				className={`relative z-10 max-h-[90dvh] overflow-y-auto border border-zinc-200/80 bg-white
				           shadow-card-md outline-none dark:border-dark-border dark:bg-dark-raised dark:shadow-dark-card-md
				           ${isSheet
				               ? "w-full max-w-lg rounded-t-2xl px-5 pb-5 pt-3"
				               : "w-[92%] rounded-2xl px-6 py-6 sm:w-[400px]"
				           }`}
				onClick={(e) => e.stopPropagation()}
			>
				{isSheet && (
					<div className="mx-auto mb-3 h-1 w-12 rounded-full bg-zinc-300 dark:bg-dark-border" aria-hidden="true" />
				)}

				{/* Header */}
				<div className="mb-4 flex items-center justify-between">
					<h2
						id={titleId}
						className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
					>
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						data-dialog-close
						className="iconBtn -mr-2"
						aria-label="Close dialog"
					>
						<X size={18} />
					</button>
				</div>

				{children}
			</div>
		</div>
	);
}
