"use client";

import { useState } from "react";
import { Plus, Loader2, Mail, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteUserModal } from "./invite-user-modal";
import { useUsersQuery } from "../hooks/use-user-query";
import { Badge } from "@/components/ui/badge";

export function UserView() {
	const [isOpen, setIsOpen] = useState(false);
	const { data: users, isLoading } = useUsersQuery();

	return (
		<div className='p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-slate-800'>Users</h1>
					<p className='mt-2 text-slate-600'>Manage and invite users to your organization.</p>
				</div>
				<Button onClick={() => setIsOpen(true)} className='flex items-center gap-2'>
					<Plus className='w-4 h-4' />
					Invite User
				</Button>
			</div>

			<InviteUserModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

			<div className='mt-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden'>
				{isLoading ? (
					<div className='flex items-center justify-center p-12'>
						<Loader2 className='w-8 h-8 animate-spin text-slate-400' />
					</div>
				) : (
					<table className='w-full text-left'>
						<thead className='bg-slate-50 border-b border-slate-100'>
							<tr>
								<th className='px-6 py-4 font-semibold text-slate-700'>User</th>
								<th className='px-6 py-4 font-semibold text-slate-700'>Role</th>
								<th className='px-6 py-4 font-semibold text-slate-700'>Division / Dept</th>
								<th className='px-6 py-4 font-semibold text-slate-700'>Employee ID</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100'>
							{users?.length === 0 ? (
								<tr>
									<td colSpan={4} className='px-6 py-8 text-center text-slate-500'>
										No users found. Invite one to get started.
									</td>
								</tr>
							) : (
								users?.map((user) => (
									<tr key={user.id} className='hover:bg-slate-50 transition-colors'>
										<td className='px-6 py-4'>
											<div className='flex flex-col'>
												<span className='font-medium text-slate-900'>
													{user.profile?.fullName || "No Name"}
												</span>
												<span className='text-sm text-slate-500 flex items-center gap-1'>
													<Mail className='w-3 h-3' />
													{user.email}
												</span>
											</div>
										</td>
										<td className='px-6 py-4'>
											<div className='flex flex-wrap gap-1'>
												{user.roles.map((row) => (
													<Badge key={row.role.id} variant='secondary' className='text-xs'>
														{row.role.name}
													</Badge>
												))}
											</div>
										</td>
										<td className='px-6 py-4'>
											<div className='flex flex-col text-sm'>
												<span className='text-slate-700 flex items-center gap-1'>
													<Building2 className='w-3 h-3 text-slate-400' />
													{user.profile?.division?.name || "-"}
												</span>
												<span className='text-slate-500 flex items-center gap-1'>
													<Briefcase className='w-3 h-3 text-slate-400' />
													{user.profile?.department?.name || "-"}
												</span>
											</div>
										</td>
										<td className='px-6 py-4 text-slate-400 text-xs font-mono uppercase'>
											{user.profile?.empId || "-"}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
