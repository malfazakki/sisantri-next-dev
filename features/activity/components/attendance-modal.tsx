"use client";

import { useState, useMemo } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Activity, attendanceStatus } from "../types/activity-schema";
import { useActivityAttendanceQuery } from "../hooks/use-activity-attendance-query";
import { useUpdateActivityAttendanceMutation } from "../hooks/use-activity-attendance-mutation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Check, AlertCircle, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface AttendanceModalProps {
	activity: Activity | null;
	isOpen: boolean;
	onClose: () => void;
}

export function AttendanceModal({ activity, isOpen, onClose }: AttendanceModalProps) {
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [localChanges, setLocalChanges] = useState<Record<string, string>>({});
	const [lastResetKey, setLastResetKey] = useState<string>("");

	const { data: attendance, isLoading } = useActivityAttendanceQuery(activity?.id, selectedDate);
	const mutation = useUpdateActivityAttendanceMutation(activity?.id);

	// Reset local changes when activity or date changes
	const currentResetKey = `${activity?.id}-${selectedDate.toISOString()}`;
	if (lastResetKey !== currentResetKey) {
		setLastResetKey(currentResetKey);
		setLocalChanges({});
	}

	// Derive current attendance state by merging server data and local changes
	const serverAttendanceData = useMemo(() => {
		const data: Record<string, string> = {};
		attendance?.forEach((item) => {
			if (item.status) {
				data[item.profileId] = item.status;
			}
		});
		return data;
	}, [attendance]);

	const attendanceData = useMemo(() => ({
		...serverAttendanceData,
		...localChanges
	}), [serverAttendanceData, localChanges]);

	const handleStatusChange = (profileId: string, status: string) => {
		setLocalChanges((prev) => ({
			...prev,
			[profileId]: status,
		}));
	};

	const onSave = () => {
		if (!activity) return;

		const attendances = Object.entries(attendanceData).map(([profileId, status]) => ({
			profileId,
			status,
		}));

		mutation.mutate({
			date: selectedDate,
			attendances,
		});
	};

	const allUsersAccountedFor = attendance ? Object.keys(attendanceData).length === attendance.length : false;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[700px] max-h-[90vh] flex flex-col'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-xl'>
						<CalendarIcon className='w-5 h-5 text-blue-500' />
						Attendance: {activity?.name}
					</DialogTitle>
				</DialogHeader>

				<div className='flex flex-col gap-6 py-4 overflow-hidden'>
					<div className='flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border'>
						<div className='flex flex-col gap-1'>
							<span className='text-sm font-medium text-zinc-500'>Select Date</span>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={"outline"}
										className={cn(
											"w-[240px] justify-start text-left font-normal border-zinc-200 dark:border-zinc-800",
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
						</div>

						<div className='flex flex-col items-end gap-1'>
							<span className='text-sm font-medium text-zinc-500'>Status Summary</span>
							<div className='flex gap-2 text-xs'>
								<span className='px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'>
									Present: {Object.values(attendanceData).filter(s => s === attendanceStatus.PRESENT).length}
								</span>
								<span className='px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'>
									Absent: {Object.values(attendanceData).filter(s => s === attendanceStatus.ABSENT).length}
								</span>
							</div>
						</div>
					</div>

					{isLoading ? (
						<div className='flex flex-col items-center justify-center py-20 gap-3'>
							<Loader2 className='w-8 h-8 animate-spin text-zinc-400' />
							<p className='text-zinc-500 text-sm'>Loading registrants...</p>
						</div>
					) : attendance?.length === 0 ? (
						<div className='flex flex-col items-center justify-center py-20 gap-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed'>
							<AlertCircle className='w-12 h-12 text-zinc-300' />
							<p className='text-zinc-500 font-medium'>No users assigned to this activity</p>
							<p className='text-zinc-400 text-sm text-center max-w-[300px]'>
								Please assign users to this activity first before taking attendance.
							</p>
						</div>
					) : (
						<div className='flex-1 overflow-y-auto pr-2'>
							<table className='w-full'>
								<thead className='sticky top-0 bg-white dark:bg-zinc-950 z-10'>
									<tr className='border-b text-xs font-semibold text-zinc-500 uppercase tracking-wider'>
										<th className='py-3 text-left pl-2'>User Info</th>
										<th className='py-3 text-right pr-2'>Status</th>
									</tr>
								</thead>
								<tbody className='divide-y dark:divide-zinc-800'>
									{attendance?.map((item) => (
										<tr key={item.profileId} className='hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors'>
											<td className='py-3 pl-2'>
												<div className='flex flex-col'>
													<span className='font-medium text-zinc-900 dark:text-zinc-100'>
														{item.profile.fullName}
													</span>
													<div className='flex items-center gap-2 text-xs text-zinc-500'>
														<span className='font-mono bg-zinc-100 dark:bg-zinc-800 px-1 rounded'>
															{item.profile.empId}
														</span>
														<span>•</span>
														<span>{item.profile.division?.name || "No Division"}</span>
													</div>
												</div>
											</td>
											<td className='py-3 pr-2 text-right'>
												<Select
													value={attendanceData[item.profileId] || ""}
													onValueChange={(val: string) => handleStatusChange(item.profileId, val)}
												>
													<SelectTrigger className={cn(
														"w-[130px] ml-auto h-9 text-sm",
														attendanceData[item.profileId] === "H" && "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
														attendanceData[item.profileId] === "A" && "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
														attendanceData[item.profileId] === "S" && "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
														attendanceData[item.profileId] === "I" && "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
													)}>
														<SelectValue placeholder="Status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="H">Hadir</SelectItem>
														<SelectItem value="S">Sakit</SelectItem>
														<SelectItem value="I">Izin</SelectItem>
														<SelectItem value="A">Alfa</SelectItem>
													</SelectContent>
												</Select>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<DialogFooter className='border-t pt-4 bg-zinc-50/50 dark:bg-zinc-900/50 -mx-6 px-6 -mb-6 pb-6'>
					<div className='flex items-center justify-between w-full'>
						<div className='flex items-center gap-2'>
							{!allUsersAccountedFor && attendance && attendance.length > 0 && (
								<div className='flex items-center gap-1.5 text-xs text-amber-600 font-medium bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded'>
									<Info className='w-3.5 h-3.5' />
									Some users missing status
								</div>
							)}
						</div>
						<div className='flex items-center gap-3'>
							<Button variant='ghost' onClick={onClose} disabled={mutation.isPending}>
								Cancel
							</Button>
							<Button 
								onClick={onSave} 
								disabled={mutation.isPending || !attendance || attendance.length === 0}
								className='min-w-[120px]'
							>
								{mutation.isPending ? (
									<>
										<Loader2 className='w-4 h-4 mr-2 animate-spin' />
										Saving...
									</>
								) : (
									<>
										<Check className='w-4 h-4 mr-2' />
										Save Changes
									</>
								)}
							</Button>
						</div>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
