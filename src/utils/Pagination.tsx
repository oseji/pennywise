"use client";
import React from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    paginationRange: (number | string)[];
    onPageChange: (page: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    paginationRange,
    onPageChange,
}) => {
    return (
        <div className="flex flex-row items-center justify-center gap-10 mt-4">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className={`transition duration-300 ease-in-out disabled:opacity-50 hover:scale-125 ${currentPage === 1 ? "cursor-not-allowed" : ""}`}
            >
                {/* Prev */}
                <ArrowLeft size={24} className="text-[#2D6A4F]" />
            </button>

            {/* Page Buttons */}
            <div className="flex flex-row items-center gap-2 ">
                {paginationRange.map((page, i) =>
                    typeof page === "string" ? (
                        <span key={i} className="px-3 py-1">
                            {page}
                        </span>
                    ) : (
                        <button
                            key={i}
                            onClick={() => onPageChange(page)}
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

            {/* Next Button */}
            <button
                onClick={() =>
                    onPageChange(Math.min(currentPage + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`transition duration-300 ease-in-out disabled:opacity-50 hover:scale-125 ${currentPage === totalPages ? "cursor-not-allowed" : ""}`}
            >
                {/* Next */}
                <ArrowRight size={24} className="text-[#2D6A4F]" />
            </button>
        </div>
    );
};

export default Pagination;
