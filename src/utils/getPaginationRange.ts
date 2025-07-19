export const getPaginationRange = (
	currentPage: number,
	totalPages: number,
	siblingCount = 1
) => {
	const totalPageNumbers = siblingCount * 2 + 5; // 5 = first, last, 2 ellipses, current

	if (totalPages <= totalPageNumbers) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
	const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

	const showLeftEllipsis = leftSiblingIndex > 2;
	const showRightEllipsis = rightSiblingIndex < totalPages - 1;

	const range = [];

	if (!showLeftEllipsis && showRightEllipsis) {
		for (let i = 1; i <= 3 + 2 * siblingCount; i++) {
			range.push(i);
		}
		range.push("...");
		range.push(totalPages);
	} else if (showLeftEllipsis && !showRightEllipsis) {
		range.push(1);
		range.push("...");
		for (let i = totalPages - (2 + 2 * siblingCount); i <= totalPages; i++) {
			range.push(i);
		}
	} else if (showLeftEllipsis && showRightEllipsis) {
		range.push(1);
		range.push("...");
		for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
			range.push(i);
		}
		range.push("...");
		range.push(totalPages);
	}

	return range;
};
