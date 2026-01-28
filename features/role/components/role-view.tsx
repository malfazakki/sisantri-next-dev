"use client";

import { useState } from "react";
import { Plus, Loader2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateRoleModal } from "./create-role-modal";
import { UpdateRoleModal } from "./update-role-modal";
import { useRolesQuery } from "../hooks/use-role-query";
import { useDeleteRoleMutation } from "../hooks/use-role-mutation";
import { Role } from "../types/role-schema";

export function RoleView() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingRole, setEditingRole] = useState<Role | null>(null);
	
	const { data: roles, isLoading } = useRolesQuery();
	const { mutate: deleteRole } = useDeleteRoleMutation();

	const onDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this role?")) {
			deleteRole(id);
		}
	};

	return (
		<div className='p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-slate-800'>Roles</h1>
					<p className='mt-2 text-slate-600'>Manage and view system roles.</p>
				</div>
				<Button onClick={() => setIsCreateOpen(true)} className='flex items-center gap-2'>
					<Plus className='w-4 h-4' />
					Add Role
				</Button>
			</div>

			<CreateRoleModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
			<UpdateRoleModal 
				role={editingRole} 
				isOpen={!!editingRole} 
				onClose={() => setEditingRole(null)} 
			/>

			<div className='mt-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden'>
				{isLoading ? (
					<div className='flex items-center justify-center p-12'>
						<Loader2 className='w-8 h-8 animate-spin text-slate-400' />
					</div>
				) : (
					<table className='w-full text-left'>
						<thead className='bg-slate-50 border-b border-slate-100'>
							<tr>
								<th className='px-6 py-4 font-semibold text-slate-700'>Name</th>
								<th className='px-6 py-4 font-semibold text-slate-700'>Description</th>
								<th className='px-6 py-4 font-semibold text-slate-700 text-right'>Actions</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100'>
							{roles?.length === 0 ? (
								<tr>
									<td colSpan={3} className='px-6 py-8 text-center text-slate-500'>
										No roles found. Create one to get started.
									</td>
								</tr>
							) : (
								roles?.map((role) => (
									<tr key={role.id} className='hover:bg-slate-50 transition-colors'>
										<td className='px-6 py-4 text-slate-600 font-medium'>{role.name}</td>
										<td className='px-6 py-4 text-slate-500'>{role.description || "-"}</td>
										<td className='px-6 py-4 text-right flex justify-end gap-2'>
											<Button
												variant='ghost'
												size='icon'
												className='text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
												onClick={() => setEditingRole(role)}
											>
												<Edit className='w-4 h-4' />
											</Button>
											<Button
												variant='ghost'
												size='icon'
												className='text-slate-400 hover:text-red-600 hover:bg-red-50'
												onClick={() => onDelete(role.id)}
											>
												<Trash2 className='w-4 h-4' />
											</Button>
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
