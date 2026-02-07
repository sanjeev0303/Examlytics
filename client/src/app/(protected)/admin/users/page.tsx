"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, User } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch((err) => {
        console.error("Failed to load users", err);
        // Fallback mock
        setUsers([
            { id: "1", firstName: "Alice", lastName: "Doe", email: "alice@example.com", role: "USER" },
            { id: "2", firstName: "Bob", lastName: "Smith", email: "bob@example.com", role: "ADMIN" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading Users...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="text-sm text-gray-500">Total Users: {users.length}</div>
      </div>

      <Card>
        <CardContent className="p-0">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <th className="px-6 py-3">User</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {user.firstName?.[0] || <User className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                        <div className="text-gray-500 text-xs flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {user.email}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Button variant="outline" size="sm">View Profile</Button>
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
