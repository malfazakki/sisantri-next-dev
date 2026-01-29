"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Plus,
	Loader2,
	Trash2,
	Edit2,
	Activity as ActivityIcon,
	UserPlus,
	Users,
	CalendarCheck,
	BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateActivityModal } from "./create-activity-modal";
import { UpdateActivityModal } from "./update-activity-modal";
import { AssignUsersModal } from "./assign-users-modal";
import { useActivitiesQuery } from "../hooks/use-activity-query";
import { useDeleteActivityMutation } from "../hooks/use-activity-mutation";
import { Activity } from "../types/activity-schema";

export function ActivityView() {
	const router = useRouter();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
	const [assigningActivity, setAssigningActivity] = useState<Activity | null>(null);

	const { data: activities, isLoading } = useActivitiesQuery();
	const { mutate: deleteActivity } = useDeleteActivityMutation();

	const onDelete = (id: number) => {
		if (confirm("Are you sure you want to delete this activity?")) {
			deleteActivity(id);
		}
	};

	return (
		<div className='flex flex-col gap-8 p-6'>
			<div className='flex items-center justify-between'>
				<div className='flex flex-col gap-1'>
					<h1 className='text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>Activities</h1>
					<p className='text-zinc-500 dark:text-zinc-400'>Manage and monitor all organization activities.</p>
				</div>
				<div className='flex items-center gap-3'>
					<Button
						variant='outline'
						onClick={() => router.push("/activities/report")}
						className='flex items-center gap-2'
					>
						<BarChart3 className='w-4 h-4' />
						Attendance Report
					</Button>
					<Button onClick={() => setIsCreateOpen(true)} className='flex items-center gap-2'>
						<Plus className='w-4 h-4' />
						Add Activity
					</Button>
				</div>
			</div>

			<CreateActivityModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
			<UpdateActivityModal
				activity={editingActivity}
				isOpen={!!editingActivity}
				onClose={() => setEditingActivity(null)}
			/>

			<AssignUsersModal
				activity={assigningActivity}
				isOpen={!!assigningActivity}
				onClose={() => setAssigningActivity(null)}
			/>

			<div className='rounded-xl border bg-white shadow-sm dark:bg-zinc-950 overflow-hidden'>
				{isLoading ? (
					<div className='flex flex-col items-center justify-center p-20 gap-4'>
						<Loader2 className='w-10 h-10 animate-spin text-zinc-400' />
						<p className='text-zinc-500 animate-pulse'>Loading activities...</p>
					</div>
				) : (
					<div className='overflow-x-auto'>
						<table className='w-full text-left'>
							<thead>
								<tr className='border-b bg-zinc-50/50 dark:bg-zinc-900/50 transition-colors'>
									<th className='px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300'>
										Activity Name
									</th>
									<th className='px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300'>Users</th>
									<th className='px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300'>
										Internal ID
									</th>
									<th className='px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300'>
										Created At
									</th>
									<th className='px-6 py-4 font-semibold text-zinc-700 dark:text-zinc-300 text-right'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className='divide-y divide-zinc-100 dark:divide-zinc-800'>
								{activities?.length === 0 ? (
									<tr>
										<td colSpan={5} className='px-6 py-20 text-center'>
											<div className='flex flex-col items-center gap-3'>
												<div className='rounded-full bg-zinc-100 p-4 dark:bg-zinc-900'>
													<ActivityIcon className='w-8 h-8 text-zinc-400' />
												</div>
												<div className='flex flex-col gap-1'>
													<p className='text-lg font-medium text-zinc-900 dark:text-zinc-100'>
														No activities found
													</p>
													<p className='text-sm text-zinc-500'>
														Get started by creating your first activity.
													</p>
												</div>
												<Button
													variant='outline'
													onClick={() => setIsCreateOpen(true)}
													className='mt-2'
												>
													Create Activity
												</Button>
											</div>
										</td>
									</tr>
								) : (
									activities?.map((activity) => (
										<tr
											key={activity.id}
											className='hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group'
										>
											<td className='px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100'>
												{activity.name}
											</td>
											<td className='px-6 py-4'>
												<div className='flex items-center gap-2'>
													<Users className='w-4 h-4 text-zinc-400' />
													<span className='text-sm font-medium'>
														{activity._count?.activityRegistrations || 0}
													</span>
												</div>
											</td>
											<td className='px-6 py-4 text-zinc-500'>
												<span className='rounded bg-zinc-100 px-2 py-0.5 text-xs font-mono dark:bg-zinc-800'>
													ID-{activity.id}
												</span>
											</td>
											<td className='px-6 py-4 text-sm text-zinc-500'>
												{new Date(activity.createdAt).toLocaleDateString()}
											</td>
											<td className='px-6 py-4 text-right'>
												<div className='flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
													<Button
														variant='ghost'
														size='icon'
														className='h-8 w-8 text-zinc-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
														onClick={() =>
															router.push(`/activities/${activity.id}/attendance`)
														}
														title='Take Attendance'
													>
														<CalendarCheck className='w-4 h-4' />
													</Button>
													<Button
														variant='ghost'
														size='icon'
														className='h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950'
														onClick={() => setAssigningActivity(activity)}
														title='Assign Users'
													>
														<UserPlus className='w-4 h-4' />
													</Button>
													<Button
														variant='ghost'
														size='icon'
														className='h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950'
														onClick={() => setEditingActivity(activity)}
														title='Edit Activity'
													>
														<Edit2 className='w-4 h-4' />
													</Button>
													<Button
														variant='ghost'
														size='icon'
														className='h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
														onClick={() => onDelete(activity.id)}
														title='Delete Activity'
													>
														<Trash2 className='w-4 h-4' />
													</Button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
