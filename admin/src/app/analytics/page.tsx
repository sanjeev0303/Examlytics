"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export default function AnalyticsPage() {
    // Note: The internal auth is handled via HttpOnly cookies (credentials: "include")
    // or we can use useAppSelector if we need user info.

    const weakTopicsData = [
        { topic: "Thermodynamics", failureRate: 42, students: 120 },
        { topic: "Organic Chemistry", failureRate: 38, students: 95 },
        { topic: "Calculus II", failureRate: 35, students: 150 },
        { topic: "Modern Physics", failureRate: 30, students: 80 },
        { topic: "Electrostatics", failureRate: 28, students: 110 },
        { topic: "Data Structures", failureRate: 25, students: 200 },
        { topic: "System Design", failureRate: 22, students: 60 },
    ];

    const difficultyCurveData = [
        { difficulty: 1, dropOff: 5 },
        { difficulty: 2, dropOff: 8 },
        { difficulty: 3, dropOff: 12 },
        { difficulty: 4, dropOff: 25 },
        { difficulty: 5, dropOff: 40 }, // High drop off at max difficulty, expected
        { difficulty: 6, dropOff: 65 }, // Very hard
        { difficulty: 7, dropOff: 80 }, // Impossible
    ];

    return (
        <div className="p-6 space-y-8 text-white">
            <div>
                <h1 className="text-3xl font-bold">Weak Topic Intelligence</h1>
                <p className="text-gray-400 mt-2">Global analysis of concepts where students struggle the most.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-white/10 bg-[#18181b]">
                    <CardHeader>
                        <CardTitle>Top Struggle Areas</CardTitle>
                        <CardDescription>Topics with highest failure rate (&gt;90% mastery threshold)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weakTopicsData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} unit="%" />
                                <YAxis dataKey="topic" type="category" stroke="#fff" fontSize={12} width={120} />
                                <Tooltip
                                    cursor={{fill: '#374151', opacity: 0.2}}
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="failureRate" fill="#f43f5e" radius={[0, 4, 4, 0]}>
                                    {weakTopicsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                     <Card className="border-white/10 bg-[#18181b]">
                        <CardHeader>
                            <CardTitle>Difficulty Impact Analysis</CardTitle>
                            <CardDescription>User drop-off rate vs Exam Difficulty Level (1-7)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={difficultyCurveData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="difficulty" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} unit="%" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Bar dataKey="dropOff" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="border-white/10 bg-[#18181b]">
                         <CardHeader>
                            <CardTitle>Insights & Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                 <div className="text-2xl">🚨</div>
                                 <div>
                                     <h4 className="font-bold text-red-400">Critical Alert: Thermodynamics</h4>
                                     <p className="text-sm text-gray-300 mt-1">42% of students are failing basic Thermodynamics questions. Consider generating simpler practice sets or adding a "Review Module".</p>
                                 </div>
                             </div>
                             <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                 <div className="text-2xl">💡</div>
                                 <div>
                                     <h4 className="font-bold text-blue-400">Optimization Opportunity</h4>
                                     <p className="text-sm text-gray-300 mt-1">Difficulty Level 6 has a 65% drop-off. Adjusting the "Adaptive Curve" to ramp up slower might improve retention.</p>
                                 </div>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
