
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalysisLoading() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8 animate-pulse">
       <div className="text-center space-y-2 flex flex-col items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[250px] w-full rounded-xl" />
            <Skeleton className="h-[250px] w-full rounded-xl" />
            <Skeleton className="h-[250px] w-full rounded-xl" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
       </div>
    </div>
  );
}
