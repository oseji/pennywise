"use client";

import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { writeSampleMode, type SampleMode } from "@/lib/finance/sampleMode";

const OPTIONS: { value: SampleMode | null; label: string }[] = [
	{ value: null, label: "Live" },
	{ value: "full", label: "Sample" },
	{ value: "empty", label: "Empty" },
];

/** Development only: swap Firestore for synthetic data to design populated and first-run states. */
export function SampleDataToggle() {
	const sample = useFinanceStore((s) => s.sample);
	const [open, setOpen] = useState(false);

	const pick = (value: SampleMode | null) => {
		writeSampleMode(value);
		const url = new URL(window.location.href);
		url.searchParams.delete("sample");
		window.location.replace(url.toString());
	};

	return (
		<div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-30 lg:bottom-4 lg:right-4">
			{open ? (
				<div
					role="group"
					aria-label="Preview data (development only)"
					className="flex items-center gap-1 rounded-[8px] border border-dashed border-rule-2 bg-paper p-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] shadow-lift"
				>
					{OPTIONS.map((o) => {
						const active = sample === o.value;
						return (
							<button
								key={o.label}
								type="button"
								aria-pressed={active}
								onClick={() => !active && pick(o.value)}
								className={`min-h-9 rounded-[5px] px-2.5 ${active ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2"}`}
							>
								{o.label}
							</button>
						);
					})}
					<button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-[5px] text-ink-3 hover:bg-paper-2" aria-label="Hide data switcher">
						<X className="h-3.5 w-3.5" aria-hidden />
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="flex h-9 items-center gap-1.5 rounded-[8px] border border-dashed border-rule-2 bg-paper px-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-2 shadow-slip"
					aria-label="Preview data switcher (development only)"
				>
					<FlaskConical className="h-3.5 w-3.5" aria-hidden />
					{sample ?? "live"}
				</button>
			)}
		</div>
	);
}
