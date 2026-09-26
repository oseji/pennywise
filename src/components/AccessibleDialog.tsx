"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { EASE_OUT, EASE_IN } from "@/components/motion/easing";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "motion/react";
import { X } from "lucide-react";

type AccessibleDialogProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	titleId?: string;
	/** "center" is a modal slip; "sheet" rises from the bottom edge; "responsive" is a sheet below 768px. */
	variant?: "center" | "sheet" | "responsive";
	/** Hide the title visually (still labels the dialog). */
	hideTitle?: boolean;
	className?: string;
	panelClassName?: string;
};

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useIsNarrow() {
	const [narrow, setNarrow] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(max-width: 767px)");
		const update = () => setNarrow(mq.matches);
		update();
		mq.addEventListener("change", update);
		return () => mq.removeEventListener("change", update);
	}, []);
	return narrow;
}

export function AccessibleDialog({
	open,
	onClose,
	title,
	children,
	titleId = "accessible-dialog-title",
	variant = "center",
	hideTitle = false,
	className = "",
	panelClassName = "",
}: AccessibleDialogProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	// element that had focus before the dialog opened; restored on close
	const triggerRef = useRef<HTMLElement | null>(null);
	const reduced = useReducedMotion();
	const narrow = useIsNarrow();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const isSheet = variant === "sheet" || (variant === "responsive" && narrow);

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

			const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
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
			const field =
				panel.querySelector<HTMLElement>("[data-autofocus]") ??
				panel.querySelector<HTMLElement>(
					'input:not([disabled]):not([type="radio"]):not([type="checkbox"]), select:not([disabled]), textarea:not([disabled])'
				);
			const firstAction = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
				(el) => el.dataset.dialogClose === undefined
			);
			(field ?? firstAction ?? panel).focus({ preventScroll: true });
		}, 30);

		return () => {
			clearTimeout(t);
			const trigger = triggerRef.current;
			if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
		};
	}, [open]);

	const onDragEnd = (_: unknown, info: PanInfo) => {
		if (info.offset.y > 120 || info.velocity.y > 600) onClose();
	};

	const panelMotion = reduced
		? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.18 } }
		: isSheet
			? {
					initial: { y: "100%" },
					animate: { y: 0, transition: { duration: 0.42, ease: EASE_OUT } },
					exit: { y: "100%", transition: { duration: 0.22, ease: EASE_IN } },
				}
			: {
					initial: { opacity: 0, y: -14, clipPath: "inset(-10% -10% 100% -10%)" },
					animate: {
						opacity: 1,
						y: 0,
						clipPath: "inset(-10% -10% -10% -10%)",
						transition: { duration: 0.34, ease: EASE_OUT },
					},
					exit: { opacity: 0, y: 8, transition: { duration: 0.14, ease: EASE_IN } },
				};

	if (!mounted) return null;

	return createPortal(
		<AnimatePresence>
			{open && (
				<div
					className={`fixed inset-0 z-50 flex justify-center ${isSheet ? "items-end" : "items-center p-4"} ${className}`}
				>
					<motion.div
						className="absolute inset-0 bg-[rgb(6_8_7/0.55)]"
						aria-hidden="true"
						onClick={onClose}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0, transition: { duration: 0.18 } }}
						transition={{ duration: 0.24 }}
					/>

					<motion.div
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						tabIndex={-1}
						{...panelMotion}
						drag={isSheet && !reduced ? "y" : false}
						dragConstraints={{ top: 0, bottom: 0 }}
						dragElastic={{ top: 0, bottom: 0.6 }}
						onDragEnd={onDragEnd}
						className={`relative z-10 max-h-[92dvh] w-full overflow-y-auto overscroll-contain bg-paper text-ink outline-none ${
							isSheet
								? "rounded-t-[6px] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 shadow-lift sm:max-w-lg dark:ring-1 dark:ring-rule"
								: "max-w-[440px] rounded-paper px-6 pb-6 pt-5 shadow-lift dark:ring-1 dark:ring-rule"
						} ${panelClassName}`}
						onClick={(e) => e.stopPropagation()}
					>
						{isSheet && (
							<div className="mx-auto mb-2 h-1 w-10 rounded-full bg-rule-2" aria-hidden="true" />
						)}

						<div
							className={
								hideTitle
									? "absolute right-3 top-3 z-10"
									: "mb-4 flex items-center justify-between gap-3"
							}
						>
							<h2
								id={titleId}
								className={
									hideTitle
										? "sr-only"
										: "font-mono text-[15px] font-bold uppercase tracking-[0.06em] text-ink"
								}
							>
								{title}
							</h2>
							<button
								type="button"
								onClick={onClose}
								data-dialog-close
								className={`key-icon ${hideTitle ? "" : "-mr-2"}`}
								aria-label="Close dialog"
							>
								<X size={18} aria-hidden />
							</button>
						</div>

						{children}
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body
	);
}
