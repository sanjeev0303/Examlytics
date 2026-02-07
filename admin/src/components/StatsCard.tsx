import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: string | React.ReactNode;
  color?: "blue" | "purple" | "yellow" | "green" | "red" | "indigo";
}

const colorStyles = {
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    green: "bg-green-500/10 text-green-400",
    red: "bg-red-500/10 text-red-400",
    indigo: "bg-indigo-500/10 text-indigo-400",
};

export const StatsCard = ({ label, value, icon, color = "blue" }: StatsCardProps) => {
  return (
    <Card className="hover:border-white/20 transition-all shadow-lg border-white/10 bg-[#18181b]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorStyles[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-3xl font-bold text-white">{value}</span>
          <p className="text-gray-400 text-sm font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};
