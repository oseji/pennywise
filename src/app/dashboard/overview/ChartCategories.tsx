import React from "react";

type Category = {
	name: string;
	percentage: number;
};

interface CategoryListProps {
	summary: { categories: Category[] };
	colors?: string[];
	limit?: number;
}

const defaultColors = [
	"#FF6F61",
	"#6B5B95",
	"#88B04B",
	"#F7CAC9",
	"#92A8D1",
	"#F7786B",
	"#DE6FA1",
	"#009B77",
	"#FFD662",
	"#6C5B7B",
];

const ChartCategories: React.FC<CategoryListProps> = ({
	summary,
	colors = defaultColors,
	limit = 5,
}) => {
	if (!summary || !summary.categories) return null;

	// ✅ create a color mapping based on the original order
	const colorMap: Record<string, string> = {};
	summary.categories.forEach((cat, i) => {
		colorMap[cat.name] = colors[i % colors.length];
	});

	// then sort categories by percentage
	const sortedCategories = [...summary.categories].sort(
		(a, b) => b.percentage - a.percentage
	);

	const topCategories = sortedCategories.slice(0, limit);
	const otherCategories = sortedCategories.slice(limit);

	const otherTotal = otherCategories.reduce(
		(sum, cat) => sum + cat.percentage,
		0
	);

	return (
		<div className="w-full ">
			{topCategories.map((element) => (
				<div
					className="flex flex-row items-center w-full gap-2"
					key={element.name}
				>
					<div
						className="w-5 h-5 rounded-md"
						style={{ backgroundColor: colorMap[element.name] }}
					></div>

					<div className="flex flex-row items-center justify-between w-full">
						<span className="capitalize ">{element.name}</span>

						<span className="font-semibold ">{element.percentage}%</span>
					</div>
				</div>
			))}

			{otherCategories.length > 0 && (
				<div className="flex flex-row items-center justify-start w-full gap-2">
					<div
						className="w-5 h-5 rounded-md"
						// give "Others" its own color, using the next available color slot
						style={{
							backgroundColor: colors[sortedCategories.length % colors.length],
						}}
					></div>
					<span>Others</span> <span>{otherTotal.toFixed(2)}%</span>
				</div>
			)}
		</div>
	);
};

export default ChartCategories;
