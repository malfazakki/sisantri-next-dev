"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
	Calendar as CalendarIcon,
	Loader2,
	ArrowLeft,
	Search,
	FileText,
	Download,
	BarChart3,
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

export function AttendanceReportView() {
	const router = useRouter();
	const [dateRange, setDateRange] = useState<DateRange | undefined>({ 
		from: new Date(),
		to: new Date()
	});
	const [searchQuery, setSearchQuery] = useState("");

	const { data: report, isLoading } = useAttendanceReportQuery(dateRange);

	const filteredReport = useMemo(() => {
		if (!report) return [];
		return report.filter((item: AttendanceReportItem) =>
			item.name.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [report, searchQuery]);

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
				/>
				<StatCard
					label='Present'
					value={totalStats.total > 0 ? Math.round((totalStats.present / totalStats.total) * 100) : 0}
					icon={BarChart3}
					color='emerald'
					isPercentage
				/>
				<StatCard
					label='Sick'
					value={totalStats.total > 0 ? Math.round((totalStats.sick / totalStats.total) * 100) : 0}
					icon={BarChart3}
					color='blue'
					isPercentage
				/>
				<StatCard
					label='Permission'
					value={totalStats.total > 0 ? Math.round((totalStats.permission / totalStats.total) * 100) : 0}
					icon={BarChart3}
					color='amber'
					isPercentage
				/>
				<StatCard
					label='Absent'
					value={totalStats.total > 0 ? Math.round((totalStats.absent / totalStats.total) * 100) : 0}
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
													<span className='font-bold text-sm'>{item.stats.percentage}%</span>
													<div className='h-1.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden'>
														<div 
															className={cn(
																'h-full transition-all duration-500',
																item.stats.percentage >= 80 ? 'bg-emerald-500' : 
																item.stats.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'
															)}
															style={{ width: `${item.stats.percentage}%` }}
														/>
													</div>
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
		</div>
	);
}

function StatCard({ label, value, icon: Icon, color, isPercentage }: { 
	label: string, 
	value: number, 
	icon: React.ElementType, 
	color: 'emerald' | 'blue' | 'amber' | 'rose' | 'zinc',
	isPercentage?: boolean
}) {
	const colors = {
		emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
		blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
		amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
		rose: "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50",
		zinc: "bg-zinc-50 text-zinc-600 border-zinc-100 dark:bg-zinc-950/30 dark:text-zinc-400 dark:border-zinc-900/50",
	};

	return (
		<div className={cn("flex flex-col p-4 rounded-2xl border shadow-sm", colors[color])}>
			<div className='flex items-center justify-between mb-2'>
				<span className='text-xs font-semibold uppercase tracking-wider opacity-80'>{label}</span>
				<Icon className='h-4 w-4 opacity-70' />
			</div>
			<span className='text-3xl font-bold'>
				{value}
				{isPercentage && <span className='text-xl ml-0.5 opacity-80'>%</span>}
			</span>
		</div>
	);
}
