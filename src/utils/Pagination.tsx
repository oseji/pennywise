"use client";
import React from "react";

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
		<div className="flex justify-center gap-2 mt-4">
			{/* Previous Button */}
			<button
				onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
				disabled={currentPage === 1}
				className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
			>
				Prev
			</button>

			{/* Page Buttons */}
			{paginationRange.map((page, i) =>
				typeof page === "string" ? (
					<span key={i} className="px-3 py-1">
						{page}
					</span>
				) : (
					<button
						key={i}
						onClick={() => onPageChange(page)}
						className={`px-3 py-1 rounded ${
							currentPage === page ? "bg-[#2D6A4F] text-white" : "bg-gray-200"
						}`}
					>
						{page}
					</button>
				)
			)}

			{/* Next Button */}
			<button
				onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
				disabled={currentPage === totalPages}
				className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
			>
				Next
			</button>
		</div>
	);
};

export default Pagination;
