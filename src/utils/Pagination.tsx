"use client";
import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

type PaginationProps = {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	paginationRange: (number | string)[];
	onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	paginationRange,
	onPageChange,
}) => {
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<nav aria-label="Pagination" className="flex flex-col items-center gap-3 border-t border-dashed border-rule-2 px-4 py-4 sm:flex-row sm:justify-between md:px-5">
			<p className="font-mono text-[12px] uppercase tracking-[0.06em] text-ink-3">
				{startItem}–{endItem} of {totalItems}
			</p>

			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
					disabled={currentPage === 1}
					aria-label="Previous page"
					className="key-icon disabled:pointer-events-none disabled:opacity-40"
				>
					<ArrowLeft size={18} aria-hidden />
				</button>

				{paginationRange.map((page, i) =>
					typeof page === "string" ? (
						<span key={i} className="px-1.5 font-mono text-ink-3" aria-hidden>
							…
						</span>
					) : (
						<button
							key={i}
							type="button"
							onClick={() => onPageChange(page)}
							aria-label={`Page ${page}`}
							aria-current={currentPage === page ? "page" : undefined}
							className={`inline-flex h-11 min-w-11 items-center justify-center rounded-[8px] px-2 font-mono text-[13px] font-semibold tabular-nums transition-colors ${
								currentPage === page ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2 hover:text-ink"
							}`}
						>
							{page}
						</button>
					)
				)}

				<button
					type="button"
					onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
					disabled={currentPage === totalPages}
					aria-label="Next page"
					className="key-icon disabled:pointer-events-none disabled:opacity-40"
				>
					<ArrowRight size={18} aria-hidden />
				</button>
			</div>
		</nav>
	);
};

export default Pagination;
