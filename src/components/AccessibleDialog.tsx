"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type AccessibleDialogProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	titleId?: string;
};

export function AccessibleDialog({
	open,
	onClose,
	title,
	children,
	titleId = "accessible-dialog-title",
}: AccessibleDialogProps) {
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") { e.preventDefault(); onClose(); }
		};
		document.addEventListener("keydown", handleKeyDown);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = prevOverflow;
		};
	}, [open, onClose]);

	useEffect(() => {
		if (!open) return;
		const focusable = panelRef.current?.querySelector<HTMLElement>(
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		);
		const t = window.setTimeout(() => focusable?.focus(), 0);
		return () => clearTimeout(t);
	}, [open]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				aria-hidden="true"
				onClick={onClose}
				role="presentation"
			/>

			{/* Panel */}
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="relative z-10 w-[92%] max-h-[90dvh] overflow-y-auto sm:w-[400px]
				           rounded-2xl border border-zinc-200/80 bg-white px-6 py-6 shadow-card-md
				           dark:border-dark-border dark:bg-dark-raised dark:shadow-dark-card-md"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div className="mb-5 flex items-center justify-between">
					<h2
						id={titleId}
						className="text-lg font-bold text-zinc-900 dark:text-zinc-50"
					>
						{title}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-xl p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700
						           dark:hover:bg-dark-overlay dark:hover:text-zinc-200"
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
