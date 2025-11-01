import React from "react";
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type LineChartData = { name: string; value: number }[];

const LineChart: React.FC<{ data: LineChartData }> = ({ data }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow w-full min-h-[400px] text-gray-900 dark:text-gray-200 transition-colors duration-300">
    <h2 className="text-sm font-semibold mb-4 text-center text-gray-900 dark:text-gray-200">
      Weekly Patient Trend
    </h2>
    <ResponsiveContainer width="100%" height={350}>
      <ReLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
        <XAxis dataKey="name" stroke="#8884d8" />
        <YAxis stroke="#8884d8" />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1f2937",
            border: "1px solid #4b5563",
            color: "#ffffff",
          }}
          itemStyle={{ color: "#ffffff" }}
          labelStyle={{ color: "#ffffff" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3182CE"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ stroke: "#3182CE", strokeWidth: 2, fill: "white" }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  </div>
);

export default LineChart;
