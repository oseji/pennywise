"use client";

import { AccessibleDialog } from "@/components/AccessibleDialog";
import { formatCurrency } from "@/utils/formatMoney";
import type { JournalEntry } from "@/lib/finance/derive";
import type { CurrencyCode } from "@/store/usePreferencesStore";

type Props = {
	entry: JournalEntry | null;
	currency: CurrencyCode;
	onCancel: () => void;
	onConfirm: () => void;
};

export function DeleteEntryDialog({ entry, currency, onCancel, onConfirm }: Props) {
	return (
		<AccessibleDialog
			open={!!entry}
			onClose={onCancel}
			title={entry?.kind === "income" ? "Delete this income?" : "Delete this spend?"}
			titleId="delete-entry-title"
		>
			{entry && (
				<div className="rounded-[4px] bg-paper-2 px-3.5 py-3 font-mono text-[13px]">
					<p className="label">{entry.date}</p>
					<p className="mt-1 flex items-end">
						<span className="truncate font-sans text-[15px] text-ink">{entry.narration || "—"}</span>
						<span className="leader" aria-hidden />
						<span className="font-semibold tabular-nums">{formatCurrency(entry.amount, currency)}</span>
					</p>
				</div>
			)}
			<p className="mt-4 text-[15px] text-ink-2">This removes the entry permanently. It can&apos;t be undone.</p>
			<div className="mt-6 grid grid-cols-2 gap-3">
				<button type="button" className="key-plain" onClick={onCancel}>
					Cancel
				</button>
				<button type="button" className="key-void" onClick={onConfirm}>
					Delete
				</button>
			</div>
		</AccessibleDialog>
	);
}
