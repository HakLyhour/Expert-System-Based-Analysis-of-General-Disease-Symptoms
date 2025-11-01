import React, { useState } from "react";
import {
    BarChart as ReBarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";

interface DiseaseType {
    name: string;
    percentage: number;
    color: string;
}

const HorizontalBarChart: React.FC<{ data: DiseaseType[] }> = ({ data }) => {
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");

    // Sort data based on sortOrder
    const sortedData = [...data].sort((a, b) => {
        if (sortOrder === "asc") return a.percentage - b.percentage;
        if (sortOrder === "desc") return b.percentage - a.percentage;
        return 0; // "none" keeps original order
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow w-full min-h-[500px] text-gray-900 dark:text-gray-200 transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-center text-gray-900 dark:text-gray-200">
                    Type of Disease Found
                </h2>
                <div className="relative">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc" | "none")}
                        className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-sm rounded-md py-1 px-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="none">No Sort</option>
                        <option value="desc">Sort: High to Low</option>
                        <option value="asc">Sort: Low to High</option>
                    </select>
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                        ▼
                    </span>
                </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
                <ResponsiveContainer width="100%" height={Math.max(300, sortedData.length * 30)}>
                    <ReBarChart
                        data={sortedData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                    >
                        <XAxis
                            type="number"
                            dataKey="percentage"
                            unit="%"
                            domain={[0, 100]}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={150}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#1f2937",
                                border: "1px solid #4b5563",
                                color: "#ffffff",
                                borderRadius: "4px",
                            }}
                            itemStyle={{ color: "#ffffff", fontSize: "12px" }}
                            labelStyle={{ color: "#ffffff", fontSize: "12px" }}
                            formatter={(value: number) => `${value}%`}
                        />
                        <Bar dataKey="percentage" barSize={20}>
                            {sortedData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Bar>
                    </ReBarChart>
                </ResponsiveContainer>
            </div>
            <ul className="mt-6 space-y-2 px-4 text-sm">
                {sortedData.map((entry, index) => (
                    <li key={index} className="flex items-center space-x-2">
                        <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-900 dark:text-gray-200">{entry.name}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HorizontalBarChart;