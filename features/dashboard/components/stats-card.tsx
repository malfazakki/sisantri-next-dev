import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  color?: "blue" | "indigo" | "violet" | "emerald";
}

export function StatsCard({ title, value, icon: Icon, description, color = "indigo" }: StatsCardProps) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
    indigo: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400",
    violet: "text-violet-600 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-400",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
  };

  return (
    <Card className="relative overflow-hidden border-none shadow-sm ring-1 ring-zinc-200 transition-all hover:shadow-md dark:ring-zinc-800">
      <div className={`absolute top-0 left-0 h-1 w-full bg-current ${colors[color].split(' ')[0]}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</CardTitle>
        <div className={`rounded-lg p-2 ${colors[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
