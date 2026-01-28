"use client";

import { useState } from "react";
import { Plus, Loader2, Mail, Briefcase, Building2, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InviteUserModal } from "./invite-user-modal";
import { useUsersQuery } from "../hooks/use-user-query";
import { useDivisionsQuery } from "@/features/division";
import { useDepartmentsQuery } from "@/features/department";
import { useRolesQuery } from "@/features/role";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";

export function UserView() {
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [divisionId, setDivisionId] = useState("");
	const [departmentId, setDepartmentId] = useState("");
	const [roleId, setRoleId] = useState("");

	const debouncedSearch = useDebounce(search, 500);

	const { data: divisions } = useDivisionsQuery();
	const { data: departments } = useDepartmentsQuery();
	const { data: roles } = useRolesQuery();

	const { data, isLoading } = useUsersQuery({
		page,
		limit: 10,
		search: debouncedSearch,
		divisionId: divisionId || undefined,
		departmentId: departmentId || undefined,
		roleId: roleId || undefined,
	});

	const users = data?.users || [];
	const pagination = data?.pagination;

	const handleReset = () => {
		setSearch("");
		setDivisionId("");
		setDepartmentId("");
		setRoleId("");
		setPage(1);
	};

	const filteredDepartments = departments?.filter((dept) => dept.divisionId === divisionId);

	return (
		<div className='p-6 space-y-6'>
			<div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold text-slate-800 font-outfit'>Users</h1>
					<p className='mt-2 text-slate-600'>Manage and invite users to your organization.</p>
				</div>
				<Button
					onClick={() => setIsOpen(true)}
					className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white'
				>
					<Plus className='w-4 h-4' />
					Invite User
				</Button>
			</div>

			<InviteUserModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm'>
				<div className='relative lg:col-span-2'>
					<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
					<Input
						placeholder='Search by name, email, or employee ID...'
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(1);
						}}
						className='pl-10 h-10 border-slate-200'
					/>
				</div>

				<select
					value={roleId}
					onChange={(e) => {
						setRoleId(e.target.value);
						setPage(1);
					}}
					className='h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all'
				>
					<option value=''>All Roles</option>
					{roles?.map((role) => (
						<option key={role.id} value={role.id}>
							{role.name}
						</option>
					))}
				</select>

				<select
					value={divisionId}
					onChange={(e) => {
						setDivisionId(e.target.value);
						setDepartmentId("");
						setPage(1);
					}}
					className='h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all'
				>
					<option value=''>All Divisions</option>
					{divisions?.map((division) => (
						<option key={division.id} value={division.id}>
							{division.name}
						</option>
					))}
				</select>

				<select
					value={departmentId}
					onChange={(e) => {
						setDepartmentId(e.target.value);
						setPage(1);
					}}
					disabled={!divisionId}
					className='h-10 px-3 py-2 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400'
				>
					<option value=''>All Departments</option>
					{filteredDepartments?.map((dept) => (
						<option key={dept.id} value={dept.id}>
							{dept.name}
						</option>
					))}
				</select>

				{(search || divisionId || departmentId || roleId) && (
					<Button
						variant='ghost'
						onClick={handleReset}
						className='lg:col-start-5 text-slate-500 hover:text-red-600 flex items-center gap-2 h-10'
					>
						<X className='w-4 h-4' />
						Reset
					</Button>
				)}
			</div>

			<div className='bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden'>
				{isLoading ? (
					<div className='flex items-center justify-center p-12'>
						<Loader2 className='w-8 h-8 animate-spin text-indigo-400' />
					</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full text-left'>
								<thead className='bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-[11px] font-bold text-slate-500'>
									<tr>
										<th className='px-6 py-4'>User</th>
										<th className='px-6 py-4'>Role</th>
										<th className='px-6 py-4'>Division / Dept</th>
										<th className='px-6 py-4'>Employee ID</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-100'>
									{users.length === 0 ? (
										<tr>
											<td colSpan={4} className='px-6 py-12 text-center text-slate-500 italic'>
												No users found matching your filters.
											</td>
										</tr>
									) : (
										users.map((user) => (
											<tr key={user.id} className='hover:bg-slate-50/50 transition-colors group'>
												<td className='px-6 py-4'>
													<div className='flex flex-col'>
														<span className='font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors'>
															{user.profile?.fullName || "No Name"}
														</span>
														<span className='text-sm text-slate-500 flex items-center gap-1.5 mt-0.5'>
															<Mail className='w-3.5 h-3.5' />
															{user.email}
														</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex flex-wrap gap-1.5'>
														{user.roles.map((row) => (
															<Badge
																key={row.role.id}
																variant='secondary'
																className='text-[10px] bg-slate-100 text-slate-600 border-none px-2'
															>
																{row.role.name}
															</Badge>
														))}
													</div>
												</td>
												<td className='px-6 py-4'>
													<div className='flex flex-col text-sm'>
														<span className='text-slate-700 font-medium flex items-center gap-1.5'>
															<Building2 className='w-3.5 h-3.5 text-slate-400' />
															{user.profile?.division?.name || "-"}
														</span>
														<span className='text-slate-500 flex items-center gap-1.5 mt-0.5'>
															<Briefcase className='w-3.5 h-3.5 text-slate-300' />
															{user.profile?.department?.name || "-"}
														</span>
													</div>
												</td>
												<td className='px-6 py-4 text-slate-500 text-xs font-mono tracking-tighter'>
													<span className='bg-slate-50 border border-slate-100 px-2 py-1 rounded'>
														{user.profile?.empId || "-"}
													</span>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>

						{pagination && pagination.totalPages > 1 && (
							<div className='px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between'>
								<p className='text-sm text-slate-500'>
									Showing Page <span className='font-medium text-slate-900'>{pagination.page}</span>{" "}
									of <span className='font-medium text-slate-900'>{pagination.totalPages}</span>{" "}
									(Total <span className='font-medium text-slate-900'>{pagination.total}</span> users)
								</p>
								<div className='flex items-center gap-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
										className='h-8 w-8 p-0'
									>
										<ChevronLeft className='w-4 h-4' />
									</Button>
									<div className='flex items-center gap-1'>
										{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
											<Button
												key={p}
												variant={page === p ? "default" : "outline"}
												size='sm'
												onClick={() => setPage(p)}
												className={`h-8 w-8 p-0 text-xs ${page === p ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
											>
												{p}
											</Button>
										))}
									</div>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
										disabled={page === pagination.totalPages}
										className='h-8 w-8 p-0'
									>
										<ChevronRight className='w-4 h-4' />
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
