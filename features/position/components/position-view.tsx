"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2, Trash2, Search, MoreHorizontal, Edit, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreatePositionModal } from "./create-position-modal";
import { UpdatePositionModal } from "./update-position-modal";
import { usePositionsQuery } from "../hooks/use-position-query";
import { useDeletePositionMutation } from "../hooks/use-position-mutation";
import { Position } from "../types/position-schema";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PositionView() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingPosition, setEditingPosition] = useState<Position | null>(null);
	const [page, setPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [search, setSearch] = useState("");

	const { data: positions, isLoading } = usePositionsQuery();
	const { mutate: deletePosition } = useDeletePositionMutation();

	const onDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this position?")) {
			deletePosition(id);
		}
	};

	// Filter positions based on search
	const filteredPositions = positions?.filter((position) =>
		position.name.toLowerCase().includes(search.toLowerCase()) ||
		(position.description && position.description.toLowerCase().includes(search.toLowerCase())) ||
		position.id.toLowerCase().includes(search.toLowerCase())
	);

	// Pagination logic
	const totalPages = Math.ceil((filteredPositions?.length || 0) / rowsPerPage);
	const paginatedPositions = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return filteredPositions?.slice(start, end);
	}, [filteredPositions, page, rowsPerPage]);

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
					<div className='flex items-center gap-3 mb-2'>
						<h1 className='text-4xl font-extrabold text-slate-900 tracking-tight font-plus-jakarta'>
							Positions
						</h1>
						{!isLoading && positions && (
							<span className='px-3 py-1 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold'>
								{positions.length}
							</span>
						)}
					</div>
					<p className='text-sm font-medium text-slate-500'>
						Manage and view all positions in your organization
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

			<CreatePositionModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
			<UpdatePositionModal
				position={editingPosition}
				isOpen={!!editingPosition}
				onClose={() => setEditingPosition(null)}
			/>

			{/* Filters Section */}
			<div className='flex items-center justify-between gap-4'>
				<div className='flex items-center gap-2 flex-1'>
					<div className='relative max-w-sm flex-1'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
						<Input
							placeholder='Filter positions...'
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

			{/* Positions Table */}
			<div className='bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] border border-slate-200/60 overflow-hidden'>
				{isLoading ? (
					<div className='flex items-center justify-center p-16'>
						<Loader2 className='w-8 h-8 animate-spin text-slate-400' />
					</div>
				) : (
					<>
						<div className='overflow-x-auto'>
							<table className='w-full text-sm text-left'>
								<thead className='bg-slate-50/80 border-b border-slate-100'>
									<tr>
										<th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											Position Name
										</th>
										<th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											Description
										</th>
										<th className='px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											ID
										</th>
										<th className='px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500'>
											<span className='sr-only'>Actions</span>
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-100 bg-white'>
									{paginatedPositions?.length === 0 ? (
										<tr>
											<td colSpan={4} className='px-6 py-16 text-center'>
												<div className='flex flex-col items-center justify-center'>
													<div className='w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3'>
														<Briefcase className='w-6 h-6 text-slate-400' strokeWidth={1.5} />
													</div>
													<p className='text-sm font-medium text-slate-700 mb-1'>
														{search ? 'No results found' : 'No positions yet'}
													</p>
													<p className='text-xs text-slate-500'>
														{search
															? 'Try adjusting your search criteria'
															: 'Get started by creating a new position'}
													</p>
												</div>
											</td>
										</tr>
									) : (
										paginatedPositions?.map((position) => (
											<tr
												key={position.id}
												className='transition-colors duration-150 hover:bg-slate-50/50'
											>
												<td className='px-6 py-4'>
													<span className='font-semibold text-slate-900'>
														{position.name}
													</span>
												</td>
												<td className='px-6 py-4'>
													{position.description ? (
														<span className='text-slate-500 line-clamp-1 max-w-xs'>
															{position.description}
														</span>
													) : (
														<span className='italic text-slate-400'>No description</span>
													)}
												</td>
												<td className='px-6 py-4'>
													<span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-slate-500 bg-slate-50 border border-slate-200'>
														{position.id.slice(0, 8)}...
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
																onClick={() => setEditingPosition(position)}
																className='text-slate-700 cursor-pointer'
															>
																<Edit className='mr-2 h-4 w-4' />
																Edit
															</DropdownMenuItem>
															<DropdownMenuItem
																onClick={() => onDelete(position.id)}
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
						{filteredPositions && filteredPositions.length > 0 && (
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
												if (pageNum === 1 || pageNum === totalPages) return true;
												if (Math.abs(pageNum - page) <= 1) return true;
												return false;
											})
											.map((pageNum, idx, arr) => {
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
