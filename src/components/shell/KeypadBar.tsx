"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useUiStore } from "@/store/useUiStore";
import { PRIMARY_NAV, isActivePath, type NavItem } from "./nav";

function Tab({ item, active }: { item: NavItem; active: boolean }) {
	const close = useNotificationStore((s) => s.close);
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			onClick={close}
			aria-current={active ? "page" : undefined}
			className={`relative flex h-16 flex-col items-center justify-center gap-1 rounded-[8px] transition-colors ${
				active ? "text-term-ink" : "text-term-ink-2 hover:text-term-ink"
			}`}
		>
			{active && (
				<motion.span
					layoutId="keypad-tab"
					className="absolute top-0 h-[3px] w-9 rounded-b-[3px] bg-term-ink"
					transition={{ type: "spring", stiffness: 520, damping: 40 }}
				/>
			)}
			<Icon className="h-5 w-5" aria-hidden />
			<span className="font-mono text-[10px] font-semibold uppercase tracking-[0.05em]">{item.label}</span>
		</Link>
	);
}

/** Mobile and tablet navigation: the terminal's keypad row, with the green key in the middle. */
export function KeypadBar() {
	const pathname = usePathname();
	const openRingUp = useUiStore((s) => s.openRingUp);
	const [a, b, c, d] = PRIMARY_NAV;

	return (
		<nav
			aria-label="Primary"
			className="terminal fixed inset-x-0 bottom-0 z-40 border-t border-term-rule bg-term pb-[env(safe-area-inset-bottom)] lg:hidden"
		>
			<ul className="mx-auto grid max-w-xl grid-cols-5 items-end px-1">
				<li><Tab item={a} active={isActivePath(pathname, a.href)} /></li>
				<li><Tab item={b} active={isActivePath(pathname, b.href)} /></li>
				<li className="flex justify-center">
					<button
						type="button"
						onClick={() => openRingUp()}
						className="key-enter -mt-4 mb-2 h-14 w-14 flex-col gap-0.5 px-0 text-[9.5px]"
						aria-label="Ring up an entry"
					>
						<Plus className="h-5 w-5" aria-hidden strokeWidth={2.5} />
						<span aria-hidden>Ring up</span>
					</button>
				</li>
				<li><Tab item={c} active={isActivePath(pathname, c.href)} /></li>
				<li><Tab item={d} active={isActivePath(pathname, d.href)} /></li>
			</ul>
		</nav>
	);
}
