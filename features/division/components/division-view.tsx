"use client";

import { useState } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateDivisionModal } from "./create-division-modal";
import { useDivisionsQuery } from "../hooks/use-division-query";
import { useDeleteDivisionMutation } from "../hooks/use-division-mutation";

export function DivisionView() {
	const [isOpen, setIsOpen] = useState(false);
	const { data: divisions, isLoading } = useDivisionsQuery();
	const { mutate: deleteDivision } = useDeleteDivisionMutation();

	const onDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this division?")) {
			deleteDivision(id);
		}
	};

	return (
		<div className='p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-slate-800'>Division</h1>
					<p className='mt-2 text-slate-600'>Manage and view all divisions.</p>
				</div>
				<Button onClick={() => setIsOpen(true)} className='flex items-center gap-2'>
					<Plus className='w-4 h-4' />
					Add Division
				</Button>
			</div>

			<CreateDivisionModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

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
								<th className='px-6 py-4 font-semibold text-slate-700'>ID</th>
								<th className='px-6 py-4 font-semibold text-slate-700 text-right'>Actions</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100'>
							{divisions?.length === 0 ? (
								<tr>
									<td colSpan={3} className='px-6 py-8 text-center text-slate-500'>
										No divisions found. Create one to get started.
									</td>
								</tr>
							) : (
								divisions?.map((division) => (
									<tr key={division.id} className='hover:bg-slate-50 transition-colors'>
										<td className='px-6 py-4 text-slate-600'>{division.name}</td>
										<td className='px-6 py-4 text-slate-400 text-xs font-mono'>{division.id}</td>
										<td className='px-6 py-4 text-right'>
											<Button
												variant='ghost'
												size='icon'
												className='text-red-500 hover:text-red-700 hover:bg-red-50'
												onClick={() => onDelete(division.id)}
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
