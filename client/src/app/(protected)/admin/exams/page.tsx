"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, MoreVertical } from "lucide-react";

export default function AdminExamsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
        <Button className="gap-2">
            <Plus className="w-4 h-4" /> Create New Exam
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3">Exam Title</th>
                        <th className="px-6 py-3">Duration</th>
                        <th className="px-6 py-3">Difficulty</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3].map((i) => (
                        <tr key={i} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">Frontend Developer Assessment {i}</td>
                            <td className="px-6 py-4">45 mins</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">MEDIUM</span></td>
                            <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">PUBLISHED</span></td>
                            <td className="px-6 py-4 text-right">
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </CardContent>
      </Card>
    </div>
  );
}
