"use client";

import { useDashboardData } from "../hooks/use-dashboard-data";
import { StatsCard } from "./stats-card";
import { UserTable } from "./user-table";
import { Building2, Layers, Users, Loader2 } from "lucide-react";

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
		<div className='flex flex-col gap-8 p-6'>
			<div className='flex flex-col gap-2'>
				<div className='flex items-center justify-between'>
					<h1 className='text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
						{data.organizationName} Dashboard
					</h1>
					{user && <div className='text-sm font-medium text-zinc-500'>Welcome, {user.email}</div>}
				</div>
				<p className='text-zinc-500 dark:text-zinc-400'>Overview of your organization and user management.</p>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				<StatsCard
					title='Total Divisions'
					value={data.stats.divisions}
					icon={Layers}
					color='blue'
					description='Total active divisions in organization'
				/>
				<StatsCard
					title='Total Departments'
					value={data.stats.departments}
					icon={Building2}
					color='violet'
					description='Total departments across all divisions'
				/>
				<StatsCard
					title='Total Users'
					value={data.stats.users}
					icon={Users}
					color='emerald'
					description='Registered users in organization'
				/>
			</div>

			<div className='flex flex-col gap-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-xl font-semibold text-zinc-900 dark:text-zinc-100'>Organization Users</h2>
				</div>
				<UserTable users={data.users} />
			</div>
		</div>
	);
}
