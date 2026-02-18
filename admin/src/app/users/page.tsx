"use client";

import { useQuery } from "@tanstack/react-query";
export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    }
  });

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        Users
        <span className="text-sm px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          {users?.length || 0} Total
        </span>
      </h1>
      <div className="rounded-xl border border-white/10 bg-[#18181b] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
               <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
            ) : users?.map((user: any) => (
              <tr key={user.id} className="hover:bg-white/5">
                <td className="p-4 font-medium">{user.first_name} {user.last_name}</td>
                <td className="p-4 text-gray-400">{user.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
