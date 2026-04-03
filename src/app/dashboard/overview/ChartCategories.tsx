"use client";

import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";

type Category = {
    name: string;
    percentage: number;
    totalAmount?: number;
};

interface CategoryListProps {
    summary: { categories: Category[] };
    colors?: string[];
    limit?: number;
    labelMap?: Record<string, string>;
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
    labelMap,
}) => {
    const currency = usePreferencesStore((s) => s.currency);

    if (!summary || !summary.categories) return null;

    const colorMap: Record<string, string> = {};
    summary.categories.forEach((cat, i) => {
        colorMap[cat.name] = colors[i % colors.length];
    });

    const sortedCategories = [...summary.categories].sort(
        (a, b) => b.percentage - a.percentage,
    );

    const topCategories = sortedCategories.slice(0, limit);
    const otherCategories = sortedCategories.slice(limit);

    const otherTotal = otherCategories.reduce(
        (sum, cat) => sum + cat.percentage,
        0,
    );

    const displayName = (name: string) =>
        labelMap?.[name] ?? name.replace(/([A-Z])/g, " $1").trim();

    return (
        <div className="w-full max-w-full overflow-hidden text-sm text-slate-800 dark:text-slate-200">
            {topCategories.map((element) => (
                <div
                    className="flex flex-row items-center w-full min-w-0 gap-2 py-1 overflow-hidden"
                    key={element.name}
                >
                    <div
                        className="w-5 h-5 rounded-md shrink-0"
                        style={{ backgroundColor: colorMap[element.name] }}
                    />

                    <div className="flex flex-row items-center justify-between w-full min-w-0 gap-2">
                        <span className="min-w-0 max-w-[70%] whitespace-normal break-words">
                            {displayName(element.name)}
                        </span>

                        <span className="flex-shrink-0 font-semibold text-right tabular-nums">
                            {element.totalAmount !== undefined ? (
                                <span className="flex flex-col items-end leading-tight">
                                    <span>
                                        {formatMoney(
                                            element.totalAmount,
                                            currency,
                                        )}
                                    </span>
                                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                        {element.percentage}%
                                    </span>
                                </span>
                            ) : (
                                `${element.percentage}%`
                            )}
                        </span>
                    </div>
                </div>
            ))}

            {otherCategories.length > 0 && (
                <div className="flex flex-row items-center justify-between w-full min-w-0 gap-2 py-1">
                    <div
                        className="w-5 h-5 rounded-md shrink-0"
                        style={{
                            backgroundColor:
                                colors[sortedCategories.length % colors.length],
                        }}
                    />
                    <span className="min-w-0 max-w-[70%] whitespace-normal break-words">
                        Others
                    </span>
                    <span className="flex-shrink-0 font-semibold tabular-nums">
                        {otherTotal.toFixed(2)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default ChartCategories;
