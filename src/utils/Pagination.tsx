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
        <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {startItem}–{endItem} of {totalItems}
            </p>

            <div className="flex flex-row items-center justify-center gap-10">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowLeft") onPageChange(Math.max(currentPage - 1, 1));
                    }}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className={`transition duration-300 ease-in-out disabled:opacity-50 hover:scale-125 ${currentPage === 1 ? "cursor-not-allowed" : ""}`}
                >
                    <ArrowLeft size={24} className="text-[#2D6A4F]" />
                </button>

                <div className="flex flex-row items-center gap-2">
                    {paginationRange.map((page, i) =>
                        typeof page === "string" ? (
                            <span key={i} className="px-3 py-1">
                                {page}
                            </span>
                        ) : (
                            <button
                                key={i}
                                onClick={() => onPageChange(page)}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? "page" : undefined}
                                className={`px-4 py-1 rounded-lg ${
                                    currentPage === page
                                        ? "bg-[#2D6A4F] text-white"
                                        : "bg-gray-200 dark:bg-slate-700 dark:text-slate-100"
                                }`}
                            >
                                {page}
                            </button>
                        ),
                    )}
                </div>

                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowRight") onPageChange(Math.min(currentPage + 1, totalPages));
                    }}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className={`transition duration-300 ease-in-out disabled:opacity-50 hover:scale-125 ${currentPage === totalPages ? "cursor-not-allowed" : ""}`}
                >
                    <ArrowRight size={24} className="text-[#2D6A4F]" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
