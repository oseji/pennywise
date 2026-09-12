"use client";
import React from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

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
        <nav
            aria-label="Pagination"
            className="mt-4 flex flex-col items-center gap-2"
        >
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Showing {startItem}–{endItem} of {totalItems}
            </p>

            <div className="flex flex-row items-center justify-center gap-6">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="iconBtn text-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-400"
                >
                    <ArrowLeft size={22} aria-hidden />
                </button>

                <div className="flex flex-row items-center gap-1.5">
                    {paginationRange.map((page, i) =>
                        typeof page === "string" ? (
                            <span
                                key={i}
                                className="px-2 text-zinc-500 dark:text-zinc-400"
                                aria-hidden
                            >
                                {page}
                            </span>
                        ) : (
                            <button
                                key={i}
                                type="button"
                                onClick={() => onPageChange(page)}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? "page" : undefined}
                                className={`inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-semibold tabular-nums transition ${
                                    currentPage === page
                                        ? "bg-brand-500 text-white"
                                        : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-dark-muted dark:text-zinc-100 dark:hover:bg-zinc-600"
                                }`}
                            >
                                {page}
                            </button>
                        ),
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="iconBtn text-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-400"
                >
                    <ArrowRight size={22} aria-hidden />
                </button>
            </div>
        </nav>
    );
};

export default Pagination;
