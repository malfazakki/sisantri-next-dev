"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
	Calendar as CalendarIcon,
	Loader2,
	Check,
	AlertCircle,
	ArrowLeft,
	Search,
	Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useActivityQuery } from "../hooks/use-activity-query";
import { useActivityAttendanceQuery } from "../hooks/use-activity-attendance-query";
import { useUpdateActivityAttendanceMutation } from "../hooks/use-activity-attendance-mutation";
import { attendanceStatus } from "../types/activity-schema";

interface AttendanceViewProps {
	activityId: string;
}

export function AttendanceView({ activityId }: AttendanceViewProps) {
	const router = useRouter();
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [searchQuery, setSearchQuery] = useState("");
	const [localChanges, setLocalChanges] = useState<Record<string, string>>({});
	const [lastResetKey, setLastResetKey] = useState<string>("");

	const { data: activity, isLoading: isActivityLoading } = useActivityQuery(activityId);
	const { data: attendance, isLoading: isAttendanceLoading } = useActivityAttendanceQuery(
		activityId,
		selectedDate,
	);
	const mutation = useUpdateActivityAttendanceMutation(activityId);

	// Reset local changes when activity or date changes
	const currentResetKey = `${activityId}-${selectedDate.toISOString()}`;
	if (lastResetKey !== currentResetKey) {
		setLastResetKey(currentResetKey);
		setLocalChanges({});
	}

	const serverAttendanceData = useMemo(() => {
		const data: Record<string, string> = {};
		attendance?.forEach((item) => {
			if (item.status) {
				data[item.profileId] = item.status;
			}
		});
		return data;
	}, [attendance]);

	const attendanceData = useMemo(
		() => ({
			...serverAttendanceData,
			...localChanges,
		}),
		[serverAttendanceData, localChanges],
	);

	const handleStatusChange = (profileId: string, status: string) => {
		setLocalChanges((prev) => ({
			...prev,
			[profileId]: status,
		}));
	};

	const onSave = () => {
		const attendances = Object.entries(attendanceData).map(([profileId, status]) => ({
			profileId,
			status,
		}));

		mutation.mutate({
			date: selectedDate,
			attendances,
		});
	};

	const filteredAttendance = useMemo(() => {
		if (!attendance) return [];
		return attendance.filter(
			(item) =>
				item.profile.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.profile.empId.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [attendance, searchQuery]);

	const stats = useMemo(() => {
		const values = Object.values(attendanceData);
		return {
			present: values.filter((s) => s === attendanceStatus.PRESENT).length,
			sick: values.filter((s) => s === attendanceStatus.SICK).length,
			permission: values.filter((s) => s === attendanceStatus.PERMISSION).length,
			absent: values.filter((s) => s === attendanceStatus.ABSENT).length,
			total: attendance?.length || 0,
		};
	}, [attendanceData, attendance]);

	const hasChanges = Object.keys(localChanges).length > 0;

	if (isActivityLoading) {
		return (
			<div className='flex h-[60vh] flex-col items-center justify-center gap-4'>
				<Loader2 className='h-10 w-10 animate-spin text-primary' />
				<p className='text-muted-foreground'>Loading activity details...</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full'>
			{/* Breadcrumb / Back */}
			<div className='flex items-center gap-4'>
				<Button variant='ghost' size='icon' onClick={() => router.back()} className='rounded-full'>
					<ArrowLeft className='h-5 w-5' />
				</Button>
				<div className='flex flex-col'>
					<div className='flex items-center gap-2 text-sm text-muted-foreground'>
						<span>Activities</span>
						<span>/</span>
						<span>{activity?.name}</span>
					</div>
					<h1 className='text-3xl font-bold tracking-tight'>Attendance Management</h1>
				</div>
			</div>

			{/* Main Content Layout */}
			<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
				{/* Sidebar/Quick Controls */}
				<div className='lg:col-span-1 flex flex-col gap-6'>
					<div className='rounded-2xl border bg-card p-5 shadow-sm space-y-4'>
						<div className='flex items-center gap-2 font-semibold'>
							<CalendarIcon className='h-4 w-4 text-primary' />
							<span>Select Date</span>
						</div>
						<div className='flex items-center gap-2'>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"flex-1 justify-start text-left font-normal border-zinc-200 dark:border-zinc-800",
											!selectedDate && "text-muted-foreground"
										)}
									>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0' align='start'>
									<Calendar
										mode='single'
										selected={selectedDate}
										onSelect={(date: Date | undefined) => date && setSelectedDate(date)}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							<Button 
								variant='outline' 
								size='icon' 
								title='Go to Today'
								onClick={() => setSelectedDate(new Date())}
								className='shrink-0'
							>
								<span className='text-[10px] font-bold'>TOD</span>
							</Button>
						</div>
						<div className='pt-2'>
							<p className='text-xs text-muted-foreground text-center line-clamp-2'>
								Taking attendance for {format(selectedDate, "EEEE, MMMM do, yyyy")}
							</p>
						</div>
					</div>

					<div className='rounded-2xl border bg-card p-5 shadow-sm space-y-4'>
						<div className='flex items-center gap-2 font-semibold'>
							<UsersIcon className='h-4 w-4 text-primary' />
							<span>Attendance Summary</span>
						</div>
						<div className='grid grid-cols-2 gap-3'>
							<div className='p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50'>
								<p className='text-xs font-medium text-green-600 dark:text-green-400'>Present</p>
								<p className='text-2xl font-bold text-green-700 dark:text-green-300'>{stats.present}</p>
							</div>
							<div className='p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50'>
								<p className='text-xs font-medium text-red-600 dark:text-red-400'>Absent</p>
								<p className='text-2xl font-bold text-red-700 dark:text-red-300'>{stats.absent}</p>
							</div>
							<div className='p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50'>
								<p className='text-xs font-medium text-blue-600 dark:text-blue-400'>Sick</p>
								<p className='text-2xl font-bold text-blue-700 dark:text-blue-300'>{stats.sick}</p>
							</div>
							<div className='p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50'>
								<p className='text-xs font-medium text-amber-600 dark:text-amber-400'>Permission</p>
								<p className='text-2xl font-bold text-amber-700 dark:text-amber-300'>{stats.permission}</p>
							</div>
						</div>
						<div className='pt-2 border-t text-sm'>
							<div className='flex justify-between text-muted-foreground'>
								<span>Completion</span>
								<span>{stats.total > 0 ? Math.round(((stats.present + stats.sick + stats.permission + stats.absent) / stats.total) * 100) : 0}%</span>
							</div>
							<div className='mt-2 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden'>
								<div 
									className='h-full bg-primary transition-all duration-500' 
									style={{ width: `${stats.total > 0 ? ((stats.present + stats.sick + stats.permission + stats.absent) / stats.total) * 100 : 0}%` }}
								/>
							</div>
						</div>
					</div>
				</div>

				{/* User List */}
				<div className='lg:col-span-3 flex flex-col gap-4'>
					<div className='flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-sm sticky top-0 z-20'>
						<div className='relative w-full sm:w-96'>
							<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
							<Input
								placeholder='Search users by name or ID...'
								className='pl-10 rounded-xl'
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<div className='flex items-center gap-3 w-full sm:w-auto'>
							<Button 
								onClick={onSave}
								disabled={mutation.isPending || !attendance || attendance.length === 0 || !hasChanges}
								className='flex-1 sm:flex-none rounded-xl'
							>
								{mutation.isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Saving...
									</>
								) : (
									<>
										<Check className='mr-2 h-4 w-4' />
										{hasChanges ? "Save Changes" : "Saved"}
									</>
								)}
							</Button>
						</div>
					</div>

					<div className='bg-card rounded-2xl border shadow-sm overflow-hidden flex-1'>
						{isAttendanceLoading ? (
							<div className='flex flex-col items-center justify-center p-20 gap-4'>
								<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
								<p className='text-muted-foreground'>Loading attendance data...</p>
							</div>
						) : filteredAttendance.length === 0 ? (
							<div className='flex flex-col items-center justify-center p-20 gap-4 text-center'>
								<div className='h-16 w-16 rounded-full bg-muted flex items-center justify-center'>
									<AlertCircle className='h-8 w-8 text-muted-foreground' />
								</div>
								<div className='space-y-1'>
									<p className='text-lg font-semibold'>No match found</p>
									<p className='text-sm text-muted-foreground max-w-sm'>
										We couldn&apos;t find any users matching your criteria. Try adjusting your search or assign more users to this activity.
									</p>
								</div>
							</div>
						) : (
							<div className='overflow-x-auto'>
								<table className='w-full'>
									<thead>
										<tr className='border-b bg-muted/30'>
											<th className='px-6 py-4 text-left font-semibold text-sm'>User Information</th>
											<th className='px-6 py-4 text-left font-semibold text-sm'>Division & ID</th>
											<th className='px-6 py-4 text-right font-semibold text-sm'>Status Selection</th>
										</tr>
									</thead>
									<tbody className='divide-y'>
										{filteredAttendance.map((item) => (
											<tr key={item.profileId} className='hover:bg-muted/30 transition-colors group'>
												<td className='px-6 py-4'>
													<div className='flex items-center gap-3'>
														<div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase'>
															{item?.profile?.fullName.charAt(0)}
														</div>
														<div className='flex flex-col'>
															<span className='font-semibold'>{item?.profile?.fullName}</span>
															<span className='text-xs text-muted-foreground'>{item?.profile?.user?.email}</span>
														</div>
													</div>
												</td>
												<td className='px-6 py-4 text-sm'>
													<div className='flex flex-col gap-1'>
														<span className='text-muted-foreground'>{item?.profile?.division?.name || "No Division"}</span>
														<code className='text-[10px] bg-muted px-1.5 py-0.5 rounded w-fit'>{item?.profile?.empId}</code>
													</div>
												</td>
												<td className='px-6 py-4 text-right'>
													<div className='flex items-center justify-end gap-1'>
														<StatusButton
															active={attendanceData[item.profileId] === "H"}
															onClick={() => handleStatusChange(item.profileId, "H")}
															variant='present'
															label='H'
															fullName='Hadir'
														/>
														<StatusButton
															active={attendanceData[item.profileId] === "S"}
															onClick={() => handleStatusChange(item.profileId, "S")}
															variant='sick'
															label='S'
															fullName='Sakit'
														/>
														<StatusButton
															active={attendanceData[item.profileId] === "I"}
															onClick={() => handleStatusChange(item.profileId, "I")}
															variant='permission'
															label='I'
															fullName='Izin'
														/>
														<StatusButton
															active={attendanceData[item.profileId] === "A"}
															onClick={() => handleStatusChange(item.profileId, "A")}
															variant='absent'
															label='A'
															fullName='Alfa'
														/>
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
		</div>
	);
}

function StatusButton({ 
	active, 
	onClick, 
	variant, 
	label,
	fullName
}: { 
	active: boolean, 
	onClick: () => void, 
	variant: 'present' | 'sick' | 'permission' | 'absent',
	label: string,
	fullName: string
}) {
	const variants = {
		present: active 
			? "bg-green-600 text-white hover:bg-green-700 shadow-sm border-green-600" 
			: "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-400 border-green-200/50",
		sick: active 
			? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border-blue-600" 
			: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200/50",
		permission: active 
			? "bg-amber-600 text-white hover:bg-amber-700 shadow-sm border-amber-600" 
			: "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200/50",
		absent: active 
			? "bg-red-600 text-white hover:bg-red-700 shadow-sm border-red-600" 
			: "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 border-red-200/50",
	};

	return (
		<Button
			variant='outline'
			size='sm'
			title={fullName}
			className={cn(
				"h-9 w-9 p-0 rounded-xl text-xs font-bold transition-all border-2",
				variants[variant]
			)}
			onClick={onClick}
		>
			{label}
		</Button>
	);
}
