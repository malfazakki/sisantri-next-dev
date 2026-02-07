"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2, Trash2, Search, MoreHorizontal, Edit, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateBatchModal } from "./create-batch-modal";
import { UpdateBatchModal } from "./update-batch-modal";
import { useBatchesQuery } from "../hooks/use-batch-query";
import { useDeleteBatchMutation } from "../hooks/use-batch-mutation";
import { Batch } from "../types/batch-schema";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BatchView() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState("");
	const { data: batches, isLoading } = useBatchesQuery();
	const { mutate: deleteBatch } = useDeleteBatchMutation();

	const onDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this batch?")) {
			deleteBatch(id);
		}
	};

	// Filter batches based on search
	const filteredBatches = batches?.filter((batch) =>
		batch.name.toLowerCase().includes(search.toLowerCase()) ||
		batch.year.toString().includes(search) ||
		batch.id.toLowerCase().includes(search.toLowerCase())
	);

	// Pagination logic
	const totalPages = Math.ceil((filteredBatches?.length || 0) / rowsPerPage);
	const paginatedBatches = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredBatches?.slice(start, end);
	}, [filteredBatches, page, rowsPerPage]);

	// Reset to page 1 when search or rowsPerPage changes
	const handleSearchChange = (value: string) => {
		setSearch(value);
		setPage(1);
	};

	const handleRowsPerPageChange = (value: number) => {
		setRowsPerPage(value);
		setPage(1);
	};

	return (
		<div className='p-8 space-y-6'>
			{/* Page Header */}
			<div className='flex items-start justify-between'>
				<div>
					<h1 className='text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta'>
						Batches
					</h1>
					<p className='mt-2 text-sm font-medium text-slate-500'>
						Here's a list of all batches in your organization
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<Button
						onClick={() => setIsCreateOpen(true)}
						className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all'
					>
						<Plus className='w-4 h-4' strokeWidth={2.5} />
						Create
					</Button>
				</div>
			</div>

			<CreateBatchModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
			<UpdateBatchModal
				batch={editingBatch}
				isOpen={!!editingBatch}
				onClose={() => setEditingBatch(null)}
			/>

			{/* Filters Section */}
			<div className='flex items-center justify-between gap-4'>
				<div className='flex items-center gap-2 flex-1'>
					<div className='relative max-w-sm flex-1'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
						<Input
							placeholder='Filter by name, year, or ID...'
							value={search}
							onChange={(e) => handleSearchChange(e.target.value)}
							className='pl-10 h-10 border-slate-200 focus-visible:ring-indigo-500'
						/>
					</div>
				</div>
				<Button
					variant='outline'
					size='sm'
					className='border-slate-200 text-slate-700 hover:bg-slate-50 h-10'
				>
					<SlidersHorizontal className='w-4 h-4 mr-2' strokeWidth={2} />
					View
				</Button>
			</div>

			{/* Batch Table */}
			<div className='bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden'>
				{isLoading ? (
					<div className='flex items-center justify-center p-16'>
						<Loader2 className='w-8 h-8 animate-spin text-slate-400' />
					</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-slate-50/80 border-b border-slate-100'>
									<tr>
										<th className='px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											Batch
										</th>
										<th className='px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											Year
										</th>
										<th className='px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											Description
										</th>
										<th className='px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											ID
										</th>
										<th className='px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											<span className='sr-only'>Actions</span>
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-100 bg-white'>
									{paginatedBatches?.length === 0 ? (
										<tr>
											<td colSpan={5} className='px-6 py-16 text-center'>
												<div className='flex flex-col items-center justify-center'>
													<div className='w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3'>
														<SlidersHorizontal className='w-6 h-6 text-slate-400' strokeWidth={1.5} />
													</div>
													<p className='text-sm font-medium text-slate-700 mb-1'>
														{search ? 'No results found' : 'No batches yet'}
													</p>
													<p className='text-xs text-slate-500'>
														{search
															? 'Try adjusting your search criteria'
															: 'Get started by creating a new batch'}
													</p>
												</div>
											</td>
										</tr>
									) : (
										paginatedBatches?.map((batch) => (
											<tr
												key={batch.id}
												className='transition-colors duration-150 hover:bg-slate-50/50'
											>
												<td className='px-6 py-4'>
													<div className='flex items-center gap-3'>
														<div className='flex flex-col'>
															<span className='font-semibold text-slate-900'>
																{batch.name}
															</span>
														</div>
													</div>
												</td>
												<td className='px-6 py-4'>
													<span className='text-slate-600'>
														{batch.year}
													</span>
												</td>
												<td className='px-6 py-4'>
													<span className='text-slate-600'>
														{batch.description || "-"}
													</span>
												</td>
												<td className='px-6 py-4'>
													<span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono text-slate-600 bg-slate-50 border border-slate-200'>
														{batch.id.slice(0, 8)}...
													</span>
												</td>
												<td className='px-6 py-4 text-right'>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant='ghost'
																size='icon'
																className='h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100'
															>
																<MoreHorizontal className='h-4 w-4' />
																<span className='sr-only'>Open menu</span>
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align='end' className='w-40'>
															<DropdownMenuItem
																className='text-slate-700 cursor-pointer'
																onClick={() => setEditingBatch(batch)}
															>
																<Edit className='mr-2 h-4 w-4' />
																Edit
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => onDelete(batch.id)}
																className='text-red-600 focus:text-red-600 cursor-pointer'
															>
																<Trash2 className='mr-2 h-4 w-4' />
																Delete
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

						{/* Pagination Footer */}
						{filteredBatches && filteredBatches.length > 0 && (
							<div className='px-6 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between'>
								{/* Left side - Rows per page selector */}
								<div className='flex items-center gap-2'>
									<select
										value={rowsPerPage}
										onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
										className='h-9 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all'
									>
										<option value={10}>10</option>
										<option value={20}>20</option>
										<option value={30}>30</option>
										<option value={40}>40</option>
										<option value={50}>50</option>
									</select>
									<span className='text-sm text-slate-600'>Rows per page</span>
								</div>

								{/* Right side - Page navigation */}
								<div className='flex items-center gap-2'>
									<span className='text-sm text-slate-600 mr-4'>
										Page {page} of {totalPages}
									</span>

									{/* First page */}
									<Button
										variant='outline'
										size='icon'
										onClick={() => setPage(1)}
										disabled={page === 1}
										className='h-9 w-9 border-slate-200'
									>
										<ChevronsLeft className='w-4 h-4' />
									</Button>

									{/* Previous page */}
									<Button
										variant='outline'
										size='icon'
										onClick={() => setPage(page - 1)}
										disabled={page === 1}
										className='h-9 w-9 border-slate-200'
									>
										<ChevronLeft className='w-4 h-4' />
									</Button>

									{/* Page numbers */}
									<div className='flex items-center gap-1'>
										{Array.from({ length: totalPages }, (_, i) => i + 1)
											.filter(pageNum => {
												// Show first page, last page, current page, and pages around current
												if (pageNum === 1 || pageNum === totalPages) return true;
												if (Math.abs(pageNum - page) <= 1) return true;
												return false;
											})
											.map((pageNum, idx, arr) => {
												// Add ellipsis
												const prevPageNum = arr[idx - 1];
												const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

												return (
													<div key={pageNum} className='flex items-center gap-1'>
														{showEllipsis && (
															<span className='px-2 text-slate-400'>...</span>
														)}
														<Button
															variant={page === pageNum ? 'default' : 'outline'}
															size='icon'
															onClick={() => setPage(pageNum)}
															className={`h-9 w-9 ${page === pageNum
																? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
																: 'border-slate-200'
																}`}
														>
															{pageNum}
														</Button>
													</div>
												);
											})}
									</div>

									{/* Next page */}
									<Button
										variant='outline'
										size='icon'
										onClick={() => setPage(page + 1)}
										disabled={page === totalPages}
										className='h-9 w-9 border-slate-200'
									>
										<ChevronRight className='w-4 h-4' />
									</Button>

									{/* Last page */}
									<Button
										variant='outline'
										size='icon'
										onClick={() => setPage(totalPages)}
										disabled={page === totalPages}
										className='h-9 w-9 border-slate-200'
									>
										<ChevronsRight className='w-4 h-4' />
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
