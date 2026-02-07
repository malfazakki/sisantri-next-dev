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
		<div className='p-8'>
			{/* Page Header */}
			<div className='flex items-start justify-between mb-8'>
				<div>
					<div className='flex items-center gap-3 mb-2'>
						<h1 className='text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta'>
							Department
						</h1>
						{!isLoading && departments && (
							<span className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold'>
								{departments.length}
							</span>
						)}
					</div>
					<p className='text-sm font-medium text-slate-500'>
						List of all departments within the organization
					</p>
				</div>
				<Button
					onClick={() => setIsOpen(true)}
					className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all'
				>
					<Plus className='w-4 h-4' strokeWidth={2.5} />
					Add Department
				</Button>
			</div>

			<CreateDepartmentModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

			{/* Department Grid */}
			{isLoading ? (
				<div className='flex items-center justify-center p-16'>
					<Loader2 className='w-8 h-8 animate-spin text-slate-400' />
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
					{departments?.length === 0 ? (
						<div className='col-span-full p-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200'>
							<p className='text-slate-400 font-medium italic'>
								No departments found. Create one to get started.
							</p>
						</div>
					) : (
						departments?.map((dept) => (
							<div
								key={dept.id}
								className='group relative bg-white rounded-2xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:border-slate-300/70'
							>
								{/* Card Content */}
								<div className='p-6'>
									{/* Icon and Delete Button */}
									<div className='flex items-start justify-between mb-5'>
										<div className='p-3 bg-indigo-50 rounded-xl transition-all duration-200 group-hover:bg-indigo-600 group-hover:scale-110'>
											<Building2 className='w-6 h-6 text-indigo-600 transition-colors group-hover:text-white' strokeWidth={2} />
										</div>
										<Button
											variant='ghost'
											size='icon'
											className='text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors -mt-1 -mr-1'
											onClick={() => onDelete(dept.id)}
										>
											<Trash2 className='w-4 h-4' strokeWidth={2} />
										</Button>
									</div>

									{/* Department Name */}
									<h3 className='text-lg font-bold text-slate-900 mb-3 line-clamp-2 min-h-[3.5rem]'>
										{dept.name}
									</h3>

									{/* Division Badge */}
									<div className='mb-4'>
										<span className='inline-flex px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100'>
											{dept.division?.name || "No Division"}
										</span>
									</div>

									{/* Department ID */}
									<p className='text-[11px] text-slate-400 font-mono truncate'>
										{dept.id}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
}
