import { DashboardClient } from "@/features/dashboard/components/dashboard-client";

export default function Home() {
	return (
		<div className='min-h-screen bg-zinc-50/50 dark:bg-black font-sans'>
			<main className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
				<DashboardClient />
			</main>
		</div>
	);
}
