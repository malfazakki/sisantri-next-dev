"use client";

import { useDashboardData } from "../hooks/use-dashboard-data";
import { StatsCard } from "./stats-card";
import { UserTable } from "./user-table";
import { Building2, Layers, Users, Loader2, Activity } from "lucide-react";

import { useAuthStore } from "@/hooks/use-auth-store";

export function DashboardClient() {
	const { data, isLoading, isError } = useDashboardData();
	const user = useAuthStore((state) => state.user);

	if (isLoading) {
		return (
			<div className='flex h-[80vh] w-full flex-col items-center justify-center gap-4'>
				<Loader2 className='h-8 w-8 animate-spin text-zinc-500' />
				<p className='text-zinc-500 animate-pulse'>Loading dashboard data...</p>
			</div>
		);
	}

	if (isError) {
		return (
			<div className='flex h-[80vh] w-full items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-zinc-900 dark:text-zinc-100'>Error</h2>
					<p className='text-zinc-600 dark:text-zinc-400'>
						Failed to load dashboard data. Please try again later.
					</p>
				</div>
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className='flex flex-col gap-10 p-8'>
			<div className='flex flex-col gap-4'>
				<div className='flex items-center justify-between'>
					<div className='group'>
						<div className='flex items-center gap-2 mb-1'>
							<div className='w-2 h-2 rounded-full bg-indigo-600' />
							<span className='text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600/70'>Overview</span>
						</div>
						<h1 className='text-4xl font-extrabold tracking-tight text-slate-900 font-plus-jakarta'>
							SiSantri App
						</h1>
						<p className='text-slate-500 font-medium max-w-2xl mt-1'>
							Manage your organization&apos;s activities and users with real-time analytics.
						</p>
					</div>
					<div className='hidden lg:flex items-center gap-4 bg-white p-2 pr-4 rounded-2xl border border-slate-200 shadow-sm'>
						<div className='w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600'>
							<Activity size={20} />
						</div>
						<div>
							<p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Operational Status</p>
							<p className='text-sm font-bold text-slate-700'>System Active</p>
						</div>
					</div>
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
				<StatsCard
					title='Total Divisions'
					value={data.stats.divisions}
					icon={Layers}
					color='blue'
					description='Organization segments'
				/>
				<StatsCard
					title='Total Departments'
					value={data.stats.departments}
					icon={Building2}
					color='violet'
					description='Functional units'
				/>
				<StatsCard
					title='Total Activities'
					value={data.stats.activities}
					icon={Activity}
					color='indigo'
					description='Operations tracked'
				/>
				<StatsCard
					title='Total Users'
					value={data.stats.users}
					icon={Users}
					color='emerald'
					description='Active members'
				/>
			</div>

			{/* Attendance Summary Section */}
			<div className='bg-white rounded-3xl border border-slate-200 p-8 shadow-soft relative overflow-hidden'>
				<div className='absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32' />
				<div className='relative'>
					<div className='flex items-center justify-between mb-8'>
						<div>
							<h2 className='text-2xl font-bold text-slate-900 font-plus-jakarta'>
								Attendance Today
							</h2>
							<p className='text-slate-500 text-sm mt-1'>Daily participation snapshot</p>
						</div>
						<div className='text-right'>
							<p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>Total Participation</p>
							<p className='text-3xl font-extrabold text-indigo-600 font-plus-jakarta'>{data.stats.attendanceToday.total}</p>
						</div>
					</div>

					<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
						<AttendanceItem
							label="Present"
							value={data.stats.attendanceToday.present}
							total={data.stats.attendanceToday.total}
							color="emerald"
							suffix="H"
						/>
						<AttendanceItem
							label="Sick"
							value={data.stats.attendanceToday.sick}
							total={data.stats.attendanceToday.total}
							color="amber"
							suffix="S"
						/>
						<AttendanceItem
							label="Permission"
							value={data.stats.attendanceToday.permission}
							total={data.stats.attendanceToday.total}
							color="blue"
							suffix="I"
						/>
						<AttendanceItem
							label="Absent"
							value={data.stats.attendanceToday.absent}
							total={data.stats.attendanceToday.total}
							color="rose"
							suffix="A"
						/>
					</div>
				</div>
			</div>

			<div className='flex flex-col gap-6'>
				<div className='flex items-center justify-between'>
					<div>
						<h2 className='text-2xl font-bold text-slate-900 font-plus-jakarta'>
							Recent Members
						</h2>
						<p className='text-slate-500 text-sm mt-1'>Latest additions to your organization</p>
					</div>
					<button className='text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100/50'>
						View All Users
					</button>
				</div>
				<UserTable users={data.recentUsers} />
			</div>
		</div>
	);
}

function AttendanceItem({ label, value, total, color, suffix }: {
	label: string,
	value: number,
	total: number,
	color: 'emerald' | 'amber' | 'blue' | 'rose',
	suffix: string
}) {
	const percentage = total > 0 ? (value / total) * 100 : 0;

	const colors = {
		emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', dot: 'bg-emerald-400' },
		amber: { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500', dot: 'bg-amber-400' },
		blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500', dot: 'bg-blue-400' },
		rose: { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-500', dot: 'bg-rose-400' },
	};

	const c = colors[color];

	return (
		<div className='p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md'>
			<div className='flex items-center justify-between mb-4'>
				<div className='flex items-center gap-2'>
					<div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
					<span className='text-xs font-bold uppercase tracking-wider text-slate-500'>{label} ({suffix})</span>
				</div>
				<span className={`text-xs font-bold ${c.text} ${c.bg} px-2 py-0.5 rounded-full`}>
					{Math.round(percentage)}%
				</span>
			</div>
			<div className='flex items-end justify-between gap-4'>
				<span className='text-3xl font-extrabold text-slate-900 font-plus-jakarta'>{value}</span>
				<div className='flex-1 h-2 bg-slate-50 rounded-full overflow-hidden mb-2'>
					<div
						className={`h-full ${c.bar} transition-all duration-1000`}
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
