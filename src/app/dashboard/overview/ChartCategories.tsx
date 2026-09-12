"use client";

import { formatMoney } from "@/utils/formatMoney";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { CHART_COLORS } from "@/utils/chartColors";

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

// Ranked bar list: one row per category with its share drawn as a bar.
// Reads as text first (name, amount, %), so it needs no chart alternative.
const ChartCategories: React.FC<CategoryListProps> = ({
    summary,
    colors = CHART_COLORS,
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

    const otherPercentage = otherCategories.reduce(
        (sum, cat) => sum + cat.percentage,
        0,
    );
    const otherAmount = otherCategories.every((c) => c.totalAmount !== undefined)
        ? otherCategories.reduce((sum, cat) => sum + (cat.totalAmount ?? 0), 0)
        : undefined;

    const displayName = (name: string) =>
        labelMap?.[name] ?? name.replace(/([A-Z])/g, " $1").trim();

    const rows = [
        ...topCategories.map((c) => ({
            key: c.name,
            label: displayName(c.name),
            percentage: c.percentage,
            amount: c.totalAmount,
            color: colorMap[c.name],
        })),
        ...(otherCategories.length > 0
            ? [
                  {
                      key: "__others",
                      label: `Others (${otherCategories.length})`,
                      percentage: otherPercentage,
                      amount: otherAmount,
                      color: colors[sortedCategories.length % colors.length],
                  },
              ]
            : []),
    ];

    return (
        <ul className="w-full min-w-0 text-sm text-zinc-800 dark:text-zinc-200">
            {rows.map((row) => (
                <li key={row.key} className="flex flex-col gap-1.5 py-2">
                    <div className="flex items-center justify-between gap-3">
                        <span className="flex min-w-0 items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: row.color }}
                                aria-hidden="true"
                            />
                            <span className="truncate capitalize">{row.label}</span>
                        </span>
                        <span className="shrink-0 text-right font-semibold tabular-nums">
                            {row.amount !== undefined
                                ? formatMoney(row.amount, currency)
                                : null}
                            <span className="ml-1.5 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                                {Math.round(row.percentage * 10) / 10}%
                            </span>
                        </span>
                    </div>
                    <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-dark-border"
                        aria-hidden="true"
                    >
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.min(Math.max(row.percentage, 0), 100)}%`,
                                backgroundColor: row.color,
                            }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default ChartCategories;
