"use client";

import { useState } from "react";
import { Plus, Loader2, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateBatchModal } from "./create-batch-modal";
import { UpdateBatchModal } from "./update-batch-modal";
import { useBatchesQuery } from "../hooks/use-batch-query";
import { useDeleteBatchMutation } from "../hooks/use-batch-mutation";
import { Batch } from "../types/batch-schema";

export function BatchView() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
	
	const { data: batches, isLoading } = useBatchesQuery();
	const { mutate: deleteBatch } = useDeleteBatchMutation();

	const onDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this batch?")) {
			deleteBatch(id);
		}
	};

	return (
		<div className='p-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-slate-800'>Batches</h1>
					<p className='mt-2 text-slate-600'>Manage and view student batches.</p>
				</div>
				<Button onClick={() => setIsCreateOpen(true)} className='flex items-center gap-2'>
					<Plus className='w-4 h-4' />
					Add Batch
				</Button>
			</div>

			<CreateBatchModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
			<UpdateBatchModal 
				batch={editingBatch} 
				isOpen={!!editingBatch} 
				onClose={() => setEditingBatch(null)} 
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
								<th className='px-6 py-4 font-semibold text-slate-700'>Year</th>
								<th className='px-6 py-4 font-semibold text-slate-700'>Description</th>
								<th className='px-6 py-4 font-semibold text-slate-700 text-right'>Actions</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-slate-100'>
							{batches?.length === 0 ? (
								<tr>
									<td colSpan={4} className='px-6 py-8 text-center text-slate-500'>
										No batches found. Create one to get started.
									</td>
								</tr>
							) : (
								batches?.map((batch) => (
									<tr key={batch.id} className='hover:bg-slate-50 transition-colors'>
										<td className='px-6 py-4 text-slate-600 font-medium'>{batch.name}</td>
										<td className='px-6 py-4 text-slate-500'>{batch.year}</td>
										<td className='px-6 py-4 text-slate-500'>{batch.description || "-"}</td>
										<td className='px-6 py-4 text-right flex justify-end gap-2'>
											<Button
												variant='ghost'
												size='icon'
												className='text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
												onClick={() => setEditingBatch(batch)}
											>
												<Edit className='w-4 h-4' />
											</Button>
											<Button
												variant='ghost'
												size='icon'
												className='text-slate-400 hover:text-red-600 hover:bg-red-50'
												onClick={() => onDelete(batch.id)}
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
