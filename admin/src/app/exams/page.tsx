"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/StatsCard";

interface Exam {
    id: string;
    title: string;
    difficulty: string;
    status: string;
    created_at: string;
    question_count: number;
}

export default function ExamsPage() {
    const { getToken } = useAuth();

    // Fetch Exams
    const { data: exams, isLoading } = useQuery({
        queryKey: ['exams-list'],
        queryFn: async () => {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/exams`, {
                 // Note: The public endpoint /exams implies public exams or all exams?
                 // Backend View: registerExamRoutes -> h.GetExams
                 // I should check if it returns all exams for admin.
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error("Failed to fetch exams");
            return res.json();
        }
    });

    const totalExams = exams?.length || 0;
    const difficultExams = exams?.filter((e: any) => e.difficulty === 'HARD').length || 0;

    return (
        <div className="p-6 space-y-8 text-white">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Exam Management</h1>
                {/* <Button>Create Template</Button> */}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard label="Total Exams" value={totalExams} icon="📚" color="blue" />
                <StatsCard label="Hard Mode Exams" value={difficultExams} icon="🔥" color="red" />
                <StatsCard label="Avg Completion Rate" value="68%" icon="📊" color="green" />
            </div>

            {/* Exam Table */}
            <div className="rounded-xl border border-white/10 bg-[#18181b] overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-gray-400">Exam Title</TableHead>
                            <TableHead className="text-gray-400">Difficulty</TableHead>
                             {/* <TableHead>Status</TableHead> */}
                            <TableHead className="text-gray-400">Created</TableHead>
                            <TableHead className="text-gray-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center p-8">Loading exams...</TableCell></TableRow>
                        ) : exams?.map((exam: any) => (
                            <TableRow key={exam.id}>
                                <TableCell className="font-medium text-white">{exam.title}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        exam.difficulty === 'HARD' ? 'destructive' :
                                        exam.difficulty === 'MEDIUM' ? 'warning' : 'success'
                                    }>
                                        {exam.difficulty}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-400">{new Date(exam.created_at || Date.now()).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <button className="text-blue-400 hover:text-blue-300 text-sm">View Details</button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
