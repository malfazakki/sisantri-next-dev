"use client";

import { useState } from "react";
import { Plus, Loader2, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateDepartmentModal } from "./create-department-modal";
import { useDepartmentsQuery } from "../hooks/use-department-query";
import { useDeleteDepartmentMutation } from "../hooks/use-department-mutation";

export function DepartmentView() {
	const [isOpen, setIsOpen] = useState(false);
	const { data: departments, isLoading } = useDepartmentsQuery();
	const { mutate: deleteDepartment } = useDeleteDepartmentMutation();

	const onDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this department?")) {
			deleteDepartment(id);
		}
	};

	return (
		<div className='p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-slate-800'>Department</h1>
					<p className='mt-2 text-slate-600'>List of all departments within the organization.</p>
				</div>
				<Button onClick={() => setIsOpen(true)} className='flex items-center gap-2'>
					<Plus className='w-4 h-4' />
					Add Department
				</Button>
			</div>

			<CreateDepartmentModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

			{isLoading ? (
				<div className='flex items-center justify-center p-12'>
					<Loader2 className='w-8 h-8 animate-spin text-slate-400' />
				</div>
			) : (
				<div className='mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{departments?.length === 0 ? (
						<div className='col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-slate-200'>
							<p className='text-slate-500'>No departments found. Create one to get started.</p>
						</div>
					) : (
						departments?.map((dept) => (
							<div
								key={dept.id}
								className='p-5 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group relative'
							>
								<div className='flex items-start justify-between'>
									<div className='w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors'>
										<Building2 className='w-5 h-5' />
									</div>
									<Button
										variant='ghost'
										size='icon'
										className='text-slate-300 hover:text-red-500 hover:bg-red-50 -mr-2 -mt-2'
										onClick={() => onDelete(dept.id)}
									>
										<Trash2 className='w-4 h-4' />
									</Button>
								</div>
								<h3 className='mt-4 font-bold text-slate-800'>{dept.name}</h3>
								<div className='flex items-center gap-2 mt-2'>
									<span className='px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium uppercase tracking-wider'>
										{dept.division?.name || "No Division"}
									</span>
								</div>
								<p className='text-xs text-slate-400 mt-4 font-mono truncate'>ID: {dept.id}</p>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
