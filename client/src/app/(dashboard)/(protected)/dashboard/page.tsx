import { currentUser } from "@/server/auth";
import { InsightCard } from "@/components/cards/insight-card";

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 w-full">
        <div>
          <h1 className="text-3xl font-bold font-heading text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {user?.firstName}. Here is your decision center.</p>
        </div>
      </div>

      {/* Static Insight Card for LCP - Loads immediately */}
      <InsightCard
        insight="You tend to rush questions in the first 10 minutes. Slowing down by 15% could improve your score by ~12 points."
        actionLabel="Practice Pacing"
        className="h-[140px]"
      />
    </div>
  );
}
