"use client";

export function DepartmentView() {
	return (
		<div className='p-6'>
			<h1 className='text-3xl font-bold text-slate-800'>Department</h1>
			<p className='mt-2 text-slate-600'>List of all departments within the organization.</p>

			<div className='mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{["Software Engineering", "Accounting", "Talent Acquisition", "Marketing", "Infrastructure"].map(
					(dept, i) => (
						<div
							key={i}
							className='p-5 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group'
						>
							<div className='w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors'>
								{dept[0]}
							</div>
							<h3 className='mt-4 font-bold text-slate-800'>{dept}</h3>
							<p className='text-sm text-slate-500 mt-1'>12 Members</p>
						</div>
					)
				)}
			</div>
		</div>
	);
}
