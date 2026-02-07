import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  color?: "blue" | "indigo" | "violet" | "emerald";
}

// Mock data for sparklines
const generateMockData = (baseValue: number) => {
  return Array.from({ length: 10 }, (_, i) => ({
    value: Math.max(0, baseValue + Math.floor(Math.random() * 10) - 5),
  }));
};

export function StatsCard({ title, value, icon: Icon, description, color = "indigo" }: StatsCardProps) {
  const mockData = generateMockData(value);

  const colors = {
    blue: {
      accent: "bg-blue-500",
      text: "text-blue-600",
      iconBg: "bg-blue-500",
      iconText: "text-white",
      chart: "#3b82f6",
      gradient: "url(#colorBlue)",
    },
    indigo: {
      accent: "bg-indigo-500",
      text: "text-indigo-600",
      iconBg: "bg-indigo-500",
      iconText: "text-white",
      chart: "#4f46e5",
      gradient: "url(#colorIndigo)",
    },
    violet: {
      accent: "bg-violet-500",
      text: "text-violet-600",
      iconBg: "bg-violet-500",
      iconText: "text-white",
      chart: "#8b5cf6",
      gradient: "url(#colorViolet)",
    },
    emerald: {
      accent: "bg-emerald-500",
      text: "text-emerald-600",
      iconBg: "bg-emerald-500",
      iconText: "text-white",
      chart: "#10b981",
      gradient: "url(#colorEmerald)",
    },
  };

  const c = colors[color];

  return (
    <Card className='relative overflow-hidden bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:border-slate-300/70 rounded-2xl'>
      {/* Subtle top accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] ${c.accent} opacity-60`} />

      <CardContent className='pt-7 pb-6 px-6'>
        <div className='flex items-center justify-between mb-5'>
          <div className={`p-2.5 rounded-xl ${c.iconBg} shadow-sm`}>
            <Icon className={`h-[22px] w-[22px] ${c.iconText}`} strokeWidth={2} />
          </div>
          <div className='text-right flex-1 ml-4'>
            <div className='text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-2.5'>
              {title}
            </div>
            <div className={`text-[40px] font-black tracking-tight ${c.text} leading-none`}>
              {value}
            </div>
          </div>
        </div>

        <div className='flex items-end justify-between gap-4 pt-1'>
          <div className='flex-1'>
            {description && (
              <p className='text-xs font-medium text-slate-500 leading-relaxed'>
                {description}
              </p>
            )}
          </div>
          <div className='w-28 h-12 -mb-1.5'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id='colorBlue' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.15} />
                    <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorIndigo' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#4f46e5' stopOpacity={0.15} />
                    <stop offset='95%' stopColor='#4f46e5' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorViolet' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.15} />
                    <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='colorEmerald' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor='#10b981' stopOpacity={0.15} />
                    <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
                <Area
                  type='monotone'
                  dataKey='value'
                  stroke={c.chart}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={c.gradient}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
