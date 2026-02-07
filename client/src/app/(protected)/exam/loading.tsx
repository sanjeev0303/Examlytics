
import { Skeleton } from "@/components/ui/skeleton";

export default function ExamLoading() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <Skeleton className="h-10 w-48 mb-8" />

      <div className="border rounded-xl p-6 space-y-6">
         <Skeleton className="h-6 w-32" />
         <div className="grid grid-cols-2 gap-4">
             <Skeleton className="h-24 rounded-lg" />
             <Skeleton className="h-24 rounded-lg" />
             <Skeleton className="h-24 rounded-lg" />
             <Skeleton className="h-24 rounded-lg" />
         </div>
         <Skeleton className="h-10 w-full rounded-lg" />
         <Skeleton className="h-12 w-full rounded-lg mt-6" />
      </div>
    </div>
  );
}
