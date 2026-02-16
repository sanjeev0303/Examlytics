import { Sidebar } from "@/components/layout/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-gray-50 dark:bg-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
