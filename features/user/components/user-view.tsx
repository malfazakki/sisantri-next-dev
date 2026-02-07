"use client";

import { useState, useMemo } from "react";
import {
	Plus,
	Loader2,
	Mail,
	Briefcase,
	Building2,
	Search,
	ChevronLeft,
	ChevronRight,
	X,
	MoreVertical,
	Edit2,
	Users as UsersIcon,
	UserCheck,
	Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InviteUserModal } from "./invite-user-modal";
import { EditUserModal } from "./edit-user-modal";
import { useUsersQuery } from "../hooks/use-user-query";
import { useDivisionsQuery } from "@/features/division";
import { useDepartmentsQuery } from "@/features/department";
import { useRolesQuery } from "@/features/role";
import { usePositionsQuery } from "@/features/position";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { User } from "../types/user-schema";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserView() {
	const [isOpen, setIsOpen] = useState(false);
	const [editUser, setEditUser] = useState<User | null>(null);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [divisionId, setDivisionId] = useState("");
	const [departmentId, setDepartmentId] = useState("");
	const [roleId, setRoleId] = useState("");
	const [positionId, setPositionId] = useState("");

	const debouncedSearch = useDebounce(search, 500);

	const { data: divisions } = useDivisionsQuery();
	const { data: departments } = useDepartmentsQuery();
	const { data: roles } = useRolesQuery();
	const { data: positions } = usePositionsQuery();

	const { data, isLoading } = useUsersQuery({
		page,
		limit: 10,
		search: debouncedSearch,
		divisionId: divisionId || undefined,
		departmentId: departmentId || undefined,
		roleId: roleId || undefined,
		positionId: positionId || undefined,
	});

	const users = data?.users || [];
	const pagination = data?.pagination;

	// Calculate statistics
	const stats = useMemo(() => {
		const totalUsers = pagination?.total || 0;
		const activeUsers = users.length; // This would ideally come from backend
		const adminCount = users.filter(u =>
			u.roles.some(r => r.role.name.toUpperCase() === 'ADMIN')
		).length;

		return { totalUsers, activeUsers, adminCount };
	}, [users, pagination]);

	const handleReset = () => {
		setSearch("");
		setDivisionId("");
		setDepartmentId("");
		setRoleId("");
		setPositionId("");
		setPage(1);
	};

	const handleEdit = (user: User) => {
		setEditUser(user);
		setIsEditOpen(true);
	};

	const filteredDepartments = departments?.filter((dept) => dept.divisionId === divisionId);

	// Helper function to get role badge styling
	const getRoleBadgeStyle = (roleName: string) => {
		const name = roleName.toUpperCase();
		if (name === 'ADMIN') {
			return 'bg-red-50 text-red-700 border-red-200';
		} else if (name === 'USER') {
			return 'bg-blue-50 text-blue-700 border-blue-200';
		} else if (name === 'MANAGER') {
			return 'bg-purple-50 text-purple-700 border-purple-200';
		}
		return 'bg-slate-50 text-slate-700 border-slate-200';
	};

	// Helper function to get initials from name
	const getInitials = (name: string) => {
		return name
			.split(' ')
			.map(n => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className='p-8 space-y-6'>
			{/* Page Header */}
			<div className='flex flex-col md:flex-row md:items-start justify-between gap-4'>
				<div>
					<div className='flex items-center gap-3 mb-2'>
						<h1 className='text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta'>
							Users
						</h1>
						{!isLoading && pagination && (
							<span className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold'>
								{pagination.total}
							</span>
						)}
					</div>
					<p className='text-sm font-medium text-slate-500'>
						Manage and invite users to your organization
					</p>
				</div>
				<Button
					onClick={() => setIsOpen(true)}
					className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all'
				>
					<Plus className='w-4 h-4' strokeWidth={2.5} />
					Invite User
				</Button>
			</div>

			<InviteUserModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
			<EditUserModal
				isOpen={isEditOpen}
				onClose={() => {
					setIsEditOpen(false);
					setEditUser(null);
				}}
				user={editUser}
			/>

			{/* Statistics Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
				{/* Total Users */}
				<div className='bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] p-5'>
					<div className='flex items-center gap-2 mb-3'>
						<div className='p-1.5 bg-indigo-50 rounded-lg'>
							<UsersIcon className='w-4 h-4 text-indigo-600' strokeWidth={2.5} />
						</div>
						<p className='text-[10px] font-bold uppercase tracking-wider text-slate-500'>
							Total Users
						</p>
					</div>
					<div className='mb-2'>
						<p className='text-2xl font-black text-slate-900 mb-1'>
							{stats.totalUsers}
						</p>
						<p className='text-xs text-slate-500'>
							Registered accounts
						</p>
					</div>
					<div className='mt-3'>
						<div className='w-full h-1.5 bg-slate-100 rounded-full overflow-hidden'>
							<div className='h-full bg-indigo-500 rounded-full' style={{ width: '85%' }}></div>
						</div>
					</div>
				</div>

				{/* Active Users */}
				<div className='bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] p-5'>
					<div className='flex items-center gap-2 mb-3'>
						<div className='p-1.5 bg-green-50 rounded-lg'>
							<UserCheck className='w-4 h-4 text-green-600' strokeWidth={2.5} />
						</div>
						<p className='text-[10px] font-bold uppercase tracking-wider text-slate-500'>
							Active Users
						</p>
					</div>
					<div className='mb-2'>
						<p className='text-2xl font-black text-slate-900 mb-1'>
							{stats.activeUsers}
						</p>
						<p className='text-xs text-slate-500'>
							Currently active
						</p>
					</div>
					<div className='mt-3'>
						<div className='w-full h-1.5 bg-slate-100 rounded-full overflow-hidden'>
							<div className='h-full bg-green-500 rounded-full' style={{ width: '92%' }}></div>
						</div>
					</div>
				</div>

				{/* Admin Count */}
				<div className='bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] p-5'>
					<div className='flex items-center gap-2 mb-3'>
						<div className='p-1.5 bg-red-50 rounded-lg'>
							<Shield className='w-4 h-4 text-red-600' strokeWidth={2.5} />
						</div>
						<p className='text-[10px] font-bold uppercase tracking-wider text-slate-500'>
							Admin Count
						</p>
					</div>
					<div className='mb-2'>
						<p className='text-2xl font-black text-slate-900 mb-1'>
							{stats.adminCount}
						</p>
						<p className='text-xs text-slate-500'>
							With admin role
						</p>
					</div>
					<div className='mt-3'>
						<div className='w-full h-1.5 bg-slate-100 rounded-full overflow-hidden'>
							<div className='h-full bg-red-500 rounded-full' style={{ width: '65%' }}></div>
						</div>
					</div>
				</div>
			</div>

			{/* Filters Section */}
			<div className='bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] p-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
					<div className='relative lg:col-span-2'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
						<Input
							placeholder='Search by name, email, or employee ID...'
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							className='pl-10 h-11 border-slate-200'
						/>
					</div>

					<select
						value={roleId}
						onChange={(e) => {
							setRoleId(e.target.value);
							setPage(1);
						}}
						className='h-11 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all'
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
						className='h-11 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all'
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
						className='h-11 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400'
					>
						<option value=''>All Departments</option>
						{filteredDepartments?.map((dept) => (
							<option key={dept.id} value={dept.id}>
								{dept.name}
							</option>
						))}
					</select>

					<select
						value={positionId}
						onChange={(e) => {
							setPositionId(e.target.value);
							setPage(1);
						}}
						className='h-11 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all'
					>
						<option value=''>All Positions</option>
						{positions?.map((pos) => (
							<option key={pos.id} value={pos.id}>
								{pos.name}
							</option>
						))}
					</select>

					{(search || divisionId || departmentId || roleId || positionId) && (
						<Button
							variant='ghost'
							onClick={handleReset}
							className='text-slate-500 hover:text-red-600 flex items-center gap-2 h-11'
						>
							<X className='w-4 h-4' />
							Reset
						</Button>
					)}
				</div>
			</div>

			{/* Users Table */}
			<div className='bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden'>
				{isLoading ? (
					<div className='flex items-center justify-center p-16'>
						<Loader2 className='w-8 h-8 animate-spin text-indigo-400' />
					</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-slate-50/80 border-b border-slate-100'>
									<tr>
										<th className='px-8 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400'>
											User
										</th>
										<th className='px-8 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400'>
											Gender
										</th>
										<th className='px-8 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400'>
											Role
										</th>
										<th className='px-8 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400'>
											Division / Dept
										</th>
										<th className='px-8 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400'>
											Position
										</th>
										<th className='px-8 py-4 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400'>
											Employee ID
										</th>
										<th className='px-8 py-4 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400'>
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{users.length === 0 ? (
										<tr>
											<td colSpan={7} className='px-8 py-16 text-center'>
												<div className='flex flex-col items-center justify-center'>
													<div className='w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4'>
														<UsersIcon className='w-8 h-8 text-slate-300' strokeWidth={1.5} />
													</div>
													<h3 className='text-lg font-bold text-slate-700 mb-2'>No users found</h3>
													<p className='text-sm text-slate-500 mb-6 max-w-sm'>
														{search || roleId || divisionId || departmentId || positionId
															? 'No users match your current filters. Try adjusting your search criteria.'
															: 'Get started by inviting your first user to the organization.'}
													</p>
													{!(search || roleId || divisionId || departmentId || positionId) && (
														<Button
															onClick={() => setIsOpen(true)}
															className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white'
														>
															<Plus className='w-4 h-4' strokeWidth={2.5} />
															Invite User
														</Button>
													)}
												</div>
											</td>
										</tr>
									) : (
										users.map((user) => (
											<tr
												key={user.id}
												className='border-b border-slate-50 last:border-0 transition-colors duration-150 hover:bg-slate-50/50 group'
											>
												<td className='px-8 py-5'>
													<div className='flex items-center gap-3'>
														{/* Avatar with Initials */}
														<div className='w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm'>
															{getInitials(user.profile?.fullName || "UN")}
														</div>
														<div className='flex flex-col'>
															<span className='font-bold text-slate-900 group-hover:text-indigo-600 transition-colors'>
																{user.profile?.fullName || "No Name"}
															</span>
															<span className='text-sm text-slate-500 flex items-center gap-1.5 mt-0.5'>
																<Mail className='w-3.5 h-3.5' />
																{user.email}
															</span>
														</div>
													</div>
												</td>
												<td className='px-8 py-5'>
													<span className='text-sm text-slate-500'>
														{user.profile?.gender || "-"}
													</span>
												</td>
												<td className='px-8 py-5'>
													<div className='flex flex-wrap gap-1.5'>
														{user.roles.map((row) => (
															<span
																key={row.role.id}
																className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(row.role.name)}`}
															>
																{row.role.name}
															</span>
														))}
													</div>
												</td>
												<td className='px-8 py-5'>
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
												<td className='px-8 py-5'>
													<span className='text-sm text-slate-600'>
														{user.profile?.position?.name || "-"}
													</span>
												</td>
												<td className='px-8 py-5'>
													<span className='inline-flex px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600'>
														{user.profile?.empId || "-"}
													</span>
												</td>
												<td className='px-8 py-5 text-right'>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button variant='ghost' className='h-8 w-8 p-0 text-slate-400 hover:text-slate-900'>
																<MoreVertical className='h-4 w-4' />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align='end'>
															<DropdownMenuItem onClick={() => handleEdit(user)}>
																<Edit2 className='mr-2 h-4 w-4' />
																Edit
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>

						{pagination && pagination.totalPages > 1 && (
							<div className='px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between'>
								<p className='text-sm text-slate-500'>
									Showing Page <span className='font-semibold text-slate-900'>{pagination.page}</span>{" "}
									of <span className='font-semibold text-slate-900'>{pagination.totalPages}</span>{" "}
									(Total <span className='font-semibold text-slate-900'>{pagination.total}</span> users)
								</p>
								<div className='flex items-center gap-2'>
									<Button
										variant='outline'
										size='sm'
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
										className='h-9 w-9 p-0'
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
												className={`h-9 w-9 p-0 text-xs ${page === p ? "bg-indigo-600 hover:bg-indigo-700" : ""}`}
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
										className='h-9 w-9 p-0'
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
