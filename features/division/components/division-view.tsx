"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateDivisionModal } from "./create-division-modal";

export function DivisionView() {
	const [isOpen, setIsOpen] = useState(false);

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
				<table className='w-full text-left'>
					<thead className='bg-slate-50 border-b border-slate-100'>
						<tr>
							<th className='px-6 py-4 font-semibold text-slate-700'>Name</th>
							<th className='px-6 py-4 font-semibold text-slate-700'>Code</th>
							<th className='px-6 py-4 font-semibold text-slate-700'>Status</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-slate-100'>
						{["IT Division", "Finance", "Human Resources"].map((name, i) => (
							<tr key={i} className='hover:bg-slate-50 transition-colors'>
								<td className='px-6 py-4 text-slate-600'>{name}</td>
								<td className='px-6 py-4 text-slate-600'>DIV-00{i + 1}</td>
								<td className='px-6 py-4'>
									<span className='px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium'>
										Active
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
