"use client";

import { useEffect, useRef, type ReactNode } from "react";

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
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
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
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
			<div
				className="absolute inset-0 bg-black/50"
				aria-hidden="true"
				onClick={onClose}
				role="presentation"
			/>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				className="inputModals relative z-10 max-h-[90dvh] overflow-y-auto border border-slate-200/80 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-900"
				onClick={(e) => e.stopPropagation()}
			>
				<h2
					id={titleId}
					className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-slate-100"
				>
					{title}
				</h2>
				{children}
			</div>
		</div>
	);
}
