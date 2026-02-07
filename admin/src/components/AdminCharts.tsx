"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

// Mock data for initial render - will be replaced with real data logic later if needed
// Or we can pass data as props.

const overviewData = [
  { name: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "May", total: Math.floor(Math.random() * 5000) + 1000 },
  { name: "Jun", total: Math.floor(Math.random() * 5000) + 1000 },
];

const userDistributionData = [
  { name: "Active", value: 65, color: "#10b981" }, // emerald-500
  { name: "Inactive", value: 35, color: "#6b7280" }, // gray-500
];

const aiUsageData = [
  { time: "00:00", requests: 120 },
  { time: "04:00", requests: 50 },
  { time: "08:00", requests: 300 },
  { time: "12:00", requests: 800 },
  { time: "16:00", requests: 600 },
  { time: "20:00", requests: 450 },
  { time: "23:59", requests: 200 },
];

export const OverviewChart = () => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    cursor={{fill: '#374151', opacity: 0.4}}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export const UserDistributionPie = () => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    data={userDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {userDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Legend iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    )
}

export const AIUsageChart = () => {
    return (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={aiUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={3} dot={{r: 4, fill: "#8b5cf6"}} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}
