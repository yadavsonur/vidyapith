"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export const Chart = ({ data }) => {
  return (
    <div className="w-full pt-4">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#7b7462"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#dbd8d0" }}
          />
          <YAxis
            stroke="#7b7462"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: "#dbd8d0" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            cursor={{ fill: "#f4efe4" }}
            contentStyle={{
              backgroundColor: "#181613",
              borderColor: "#2a2720",
              borderRadius: "6px",
              color: "#faf8f2",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
            }}
          />
          <Bar dataKey="total" fill="#d98b2f" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
