"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import {
    Calendar as CalendarIcon,
    Loader2,
    ArrowLeft,
    Search,
    FileText,
    Download,
    BarChart3,
    CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { type DateRange } from "react-day-picker";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAttendanceReportQuery, type AttendanceReportItem } from "../hooks/use-attendance-report-query";
import { SelectActivityModal } from "./select-activity-modal";

export function AttendanceReportView() {
    const router = useRouter();
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date()
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);

    const { data: report, isLoading } = useAttendanceReportQuery(dateRange);

    const filteredReport = useMemo(() => {
        if (!report) return [];
        return report.filter((item: AttendanceReportItem) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [report, searchQuery]);

    const dayCount = useMemo(() => {
        if (!dateRange?.from) return 1;
        const to = dateRange.to || dateRange.from;
        return differenceInDays(to, dateRange.from) + 1;
    }, [dateRange]);

    const totalStats = useMemo(() => {
        if (!report) return { present: 0, sick: 0, permission: 0, absent: 0, total: 0 };
        return report.reduce(
            (acc, item: AttendanceReportItem) => ({
                present: acc.present + item.stats.present,
                sick: acc.sick + item.stats.sick,
                permission: acc.permission + item.stats.permission,
                absent: acc.absent + item.stats.absent,
                total: acc.total + item.stats.totalRegistered,
            }),
            { present: 0, sick: 0, permission: 0, absent: 0, total: 0 }
        );
    }, [report]);

    const totalCapacity = totalStats.total * dayCount;

    return (
        <div className='flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='icon' onClick={() => router.back()} className='rounded-full'>
                        <ArrowLeft className='h-5 w-5' />
                    </Button>
                    <div className='flex flex-col'>
                        <h1 className='text-3xl font-bold tracking-tight'>Attendance Report</h1>
                        <p className='text-muted-foreground text-sm'>
                            Summary of attendance across all activities
                        </p>
                    </div>
                </div>
                <div className='flex items-center gap-3'>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal w-fit min-w-[240px] rounded-xl border-zinc-200 dark:border-zinc-800",
                                    !dateRange && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className='mr-2 h-4 w-4' />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='end'>
                            <Calendar
                                mode='range'
                                selected={dateRange}
                                onSelect={(range) => range && setDateRange(range)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <Button variant='outline' className='rounded-xl border-zinc-200' onClick={() => setIsSelectModalOpen(true)}>
                        <CalendarCheck className='mr-2 h-4 w-4' />
                        Manage Attendance
                    </Button>
                    <Button variant='outline' className='rounded-xl' onClick={() => window.print()}>
                        <Download className='mr-2 h-4 w-4' />
                        Export
                    </Button>
                </div>
            </div>

            {/* Overall Stats Cards */}
            <div className='grid grid-cols-2 lg:grid-cols-5 gap-4'>
                <StatCard
                    label='Total Registered'
                    value={totalStats.total}
                    icon={FileText}
                    color='zinc'
                    donutData={[
                        { label: 'Present', value: totalStats.present, color: '#10b981' },
                        { label: 'Sick', value: totalStats.sick, color: '#3b82f6' },
                        { label: 'Permission', value: totalStats.permission, color: '#f59e0b' },
                        { label: 'Absent', value: totalStats.absent, color: '#f43f5e' },
                    ]}
                />
                <StatCard
                    label='Present'
                    value={totalCapacity > 0 ? Math.round((totalStats.present / totalCapacity) * 100) : 0}
                    icon={BarChart3}
                    color='emerald'
                    isPercentage
                />
                <StatCard
                    label='Sick'
                    value={totalCapacity > 0 ? Math.round((totalStats.sick / totalCapacity) * 100) : 0}
                    icon={BarChart3}
                    color='blue'
                    isPercentage
                />
                <StatCard
                    label='Permission'
                    value={totalCapacity > 0 ? Math.round((totalStats.permission / totalCapacity) * 100) : 0}
                    icon={BarChart3}
                    color='amber'
                    isPercentage
                />
                <StatCard
                    label='Absent'
                    value={totalCapacity > 0 ? Math.round((totalStats.absent / totalCapacity) * 100) : 0}
                    icon={BarChart3}
                    color='rose'
                    isPercentage
                />
            </div>

            {/* Main Table Area */}
            <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-4 bg-card p-4 rounded-2xl border shadow-sm'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search activity name...'
                            className='pl-10 rounded-xl'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className='bg-card rounded-2xl border shadow-sm overflow-hidden'>
                    {isLoading ? (
                        <div className='flex flex-col items-center justify-center p-20 gap-4 text-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-primary' />
                            <p className='text-muted-foreground animate-pulse'>Aggregating report data...</p>
                        </div>
                    ) : filteredReport.length === 0 ? (
                        <div className='flex flex-col items-center justify-center p-20 gap-4 text-center'>
                            <div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center'>
                                <FileText className='h-8 w-8 text-muted-foreground' />
                            </div>
                            <div className='space-y-1'>
                                <p className='text-lg font-semibold'>No data available</p>
                                <p className='text-sm text-muted-foreground'>
                                    No activity attendance records found for this date.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='border-b bg-muted/30'>
                                        <th className='px-6 py-4 text-left font-semibold text-sm'>Activity Name</th>
                                        <th className='px-6 py-4 text-center font-semibold text-sm'>Hadir</th>
                                        <th className='px-6 py-4 text-center font-semibold text-sm'>Sakit</th>
                                        <th className='px-6 py-4 text-center font-semibold text-sm'>Izin</th>
                                        <th className='px-6 py-4 text-center font-semibold text-sm'>Alfa</th>
                                        <th className='px-6 py-4 text-center font-semibold text-sm'>Total Attendance</th>
                                        <th className='px-6 py-4 text-center font-semibold text-sm'>Registered</th>
                                        <th className='px-6 py-4 text-right font-semibold text-sm'>Compliance</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y'>
                                    {filteredReport.map((item) => (
                                        <tr key={item.id} className='hover:bg-muted/30 transition-colors group'>
                                            <td className='px-6 py-4 font-medium'>{item.name}</td>
                                            <td className='px-6 py-4 text-center'>
                                                <span className='inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold'>
                                                    {item.stats.present}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                <span className='inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 font-bold'>
                                                    {item.stats.sick}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                <span className='inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 font-bold'>
                                                    {item.stats.permission}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-center'>
                                                <span className='inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 font-bold'>
                                                    {item.stats.absent}
                                                </span>
                                            </td>
                                            <td className='px-6 py-4 text-center font-semibold'>
                                                {item.stats.totalPresent}
                                            </td>
                                            <td className='px-6 py-4 text-center text-muted-foreground'>
                                                {item.stats.totalRegistered}
                                            </td>
                                            <td className='px-6 py-4 text-right'>
                                                <div className='flex flex-col items-end gap-1'>
                                                    {(() => {
                                                        const rowPercentage = (item.stats.totalRegistered * dayCount) > 0
                                                            ? Math.round((item.stats.totalPresent / (item.stats.totalRegistered * dayCount)) * 100)
                                                            : 0;
                                                        return (
                                                            <>
                                                                <span className='font-bold text-sm'>{rowPercentage}%</span>
                                                                <div className='h-1.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
                                                                    <div
                                                                        className={cn(
                                                                            'h-full transition-all duration-500',
                                                                            rowPercentage >= 80 ? 'bg-emerald-500' :
                                                                                rowPercentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                                                        )}
                                                                        style={{ width: `${rowPercentage}%` }}
                                                                    />
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <SelectActivityModal
                isOpen={isSelectModalOpen}
                onClose={() => setIsSelectModalOpen(false)}
            />
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, isPercentage, donutData }: {
    label: string,
    value: number,
    icon: React.ElementType,
    color: 'emerald' | 'blue' | 'amber' | 'rose' | 'zinc',
    isPercentage?: boolean,
    donutData?: { label: string, value: number, color: string }[]
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const colors = {
        emerald: {
            bg: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
            chart: "#10b981"
        },
        blue: {
            bg: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
            chart: "#3b82f6"
        },
        amber: {
            bg: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
            chart: "#f59e0b"
        },
        rose: {
            bg: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
            chart: "#f43f5e"
        },
        zinc: {
            bg: "bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-950/30 dark:text-zinc-400 dark:border-zinc-900/50",
            chart: "#71717a"
        },
    };

    return (
        <div className={cn("flex flex-col p-4 rounded-2xl border shadow-sm", colors[color].bg)}>
            <div className='flex items-center justify-between mb-2'>
                <span className='text-xs font-semibold uppercase tracking-wider opacity-80'>{label}</span>
                <Icon className='h-4 w-4 opacity-70' />
            </div>

            {(isPercentage || donutData) ? (
                <div className='flex items-center gap-3'>
                    <div className='relative w-16 h-16 flex-shrink-0 group/donut'>
                        <svg className='w-full h-full -rotate-90' viewBox='0 0 36 36'>
                            {/* Background circle */}
                            <circle
                                cx='18'
                                cy='18'
                                r='15.5'
                                fill='none'
                                className='stroke-current opacity-20'
                                strokeWidth='3'
                            />
                            {/* Multi-segment Donut or Single Progress */}
                            {donutData ? (
                                (() => {
                                    const total = donutData.reduce((acc, d) => acc + d.value, 0);
                                    let cumulativePercentage = 0;
                                    return donutData.map((d, i) => {
                                        if (d.value === 0) return null;
                                        const percentage = total > 0 ? (d.value / total) * 100 : 0;
                                        const dashArray = `${percentage * 0.974} 100`;
                                        const dashOffset = -cumulativePercentage * 0.974;
                                        cumulativePercentage += percentage;
                                        return (
                                            <circle
                                                key={i}
                                                cx='18'
                                                cy='18'
                                                r='15.5'
                                                fill='none'
                                                stroke={d.color}
                                                strokeWidth={hoveredIndex === i ? '4.5' : '3.5'}
                                                strokeDasharray={dashArray}
                                                strokeDashoffset={dashOffset}
                                                strokeLinecap='round'
                                                className="transition-all duration-300 cursor-pointer"
                                                onMouseEnter={() => setHoveredIndex(i)}
                                                onMouseLeave={() => setHoveredIndex(null)}
                                            />
                                        );
                                    });
                                })()
                            ) : (
                                <circle
                                    cx='18'
                                    cy='18'
                                    r='15.5'
                                    fill='none'
                                    stroke={colors[color].chart}
                                    strokeWidth='3'
                                    strokeDasharray={`${value * 0.974} 100`}
                                    strokeLinecap='round'
                                    className="transition-all duration-500"
                                />
                            )}
                        </svg>

                        {/* Tooltip */}
                        {donutData && hoveredIndex !== null && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in duration-200">
                                <div className="bg-zinc-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap flex items-center gap-1.5 border border-zinc-800">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: donutData[hoveredIndex].color }} />
                                    <span className="font-bold">{donutData[hoveredIndex].label}:</span>
                                    <span>{Math.round((donutData[hoveredIndex].value / donutData.reduce((acc, d) => acc + d.value, 0)) * 100)}%</span>
                                </div>
                                <div className="w-2 h-2 bg-zinc-900 rotate-45 mx-auto -mt-1 border-r border-b border-zinc-800" />
                            </div>
                        )}

                        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                            <span className={cn('font-bold', donutData ? 'text-xs' : 'text-lg')}>
                                {donutData ? 'Total' : `${value}%`}
                            </span>
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        <span className='text-2xl font-bold'>{value}</span>
                        <span className='text-xs opacity-70'>{isPercentage ? 'of total' : 'Registered'}</span>
                    </div>
                </div>
            ) : (
                <span className='text-3xl font-bold'>
                    {value}
                </span>
            )}
        </div>
    );
}
