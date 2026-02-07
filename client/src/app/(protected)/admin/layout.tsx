import { Sidebar } from "@/components/layout/Sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
     <div className="flex h-screen bg-gray-100 dark:bg-zinc-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                 <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Console</span>
            </div>
            {children}
        </main>
     </div>
  );
}
