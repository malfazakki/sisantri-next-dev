"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	LayoutDashboard,
	Layers,
	Building2,
	ShieldCheck,
	ChevronLeft,
	ChevronRight,
	Menu,
	X,
	Users,
	Activity,
	LogOut,
	User,
	ChevronsUpDown,
	Briefcase,
	GraduationCap,
	ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Division", href: "/division", icon: Layers },
	{ name: "Department", href: "/department", icon: Building2 },
	{ name: "Position", href: "/position", icon: Briefcase },
	{ name: "Roles", href: "/roles", icon: ShieldCheck },
	{ name: "Users", href: "/users", icon: Users },
	{ name: "Activities", href: "/activities", icon: Activity },
	{ name: "Attendance", href: "/attendance", icon: ClipboardCheck },
	{ name: "Batches", href: "/batches", icon: GraduationCap },
];

export function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuthStore();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	// Automatically collapse on medium screens, and handle mobile view
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setIsCollapsed(false); // On mobile it's either hidden or full width drawer
			} else if (window.innerWidth < 1024) {
				setIsCollapsed(true);
			} else {
				setIsCollapsed(false);
			}
		};

		// Set initial state
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const toggleSidebar = () => setIsCollapsed(!isCollapsed);
	const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

	return (
		<>
			{/* Mobile Menu Button */}
			<div className='md:hidden fixed top-4 left-4 z-50'>
				<button
					onClick={toggleMobile}
					className='p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-600'
				>
					{isMobileOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
			</div>

			{/* Mobile Overlay */}
			{isMobileOpen && (
				<div
					className='md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40'
					onClick={() => setIsMobileOpen(false)}
				/>
			)}

			{/* Sidebar Container */}
			<aside
				className={cn(
					"fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 ease-in-out flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.02)]",
					isCollapsed ? "w-20 overflow-x-hidden" : "w-64",
					isMobileOpen ? "translate-x-0 w-64" : "max-md:-translate-x-full",
					"md:translate-x-0",
				)}
			>
				{/* Logo Section */}
				<div className='h-20 flex items-center px-6'>
					<div className='flex items-center gap-3 overflow-hidden'>
						<div className='w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-indigo-200'>
							<ShieldCheck size={20} strokeWidth={2.5} />
						</div>
						{!isCollapsed && (
							<span className='font-bold text-xl text-slate-900 tracking-tight whitespace-nowrap font-plus-jakarta'>
								SiSantri
							</span>
						)}
					</div>
				</div>

				{/* Navigation Section */}
				<nav className='flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden'>
					{menuItems.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsMobileOpen(false)}
								className={cn(
									"flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
									isActive
										? "bg-indigo-50/80 text-indigo-600 shadow-sm"
										: "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
									isCollapsed && "justify-center",
								)}
							>
								{isActive && (
									<div className='absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full' />
								)}

								<Icon
									size={20}
									className={cn(
										"flex-shrink-0 transition-all",
										isActive ? "text-indigo-600 scale-110" : "text-slate-400 group-hover:text-slate-600",
									)}
								/>

								{!isCollapsed && (
									<span className={cn(
										"text-sm font-medium whitespace-nowrap",
										isActive ? "text-indigo-600" : "text-slate-600"
									)}>
										{item.name}
									</span>
								)}

								{/* Tooltip for collapsed state */}
								{isCollapsed && (
									<div className='absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-xl'>
										{item.name}
									</div>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Collapse Toggle (Desktop only) */}
				<div className='px-3 py-4 border-t border-slate-100 hidden md:block'>
					<button
						onClick={toggleSidebar}
						className='w-full h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100'
					>
						{isCollapsed ? (
							<ChevronRight size={18} />
						) : (
							<div className='flex items-center gap-2'>
								<ChevronLeft size={18} />
								<span className='text-xs font-bold uppercase tracking-widest'>Collapse</span>
							</div>
						)}
					</button>
				</div>

				{/* User Profile section */}
				<div className='p-4 border-t border-slate-100 bg-slate-50/30'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button
								className={cn(
									"flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all w-full text-left outline-none",
									isCollapsed && "justify-center px-2",
								)}
							>
								<Avatar className='h-9 w-9 border-2 border-slate-50'>
									<AvatarImage src={user?.profile?.avatar as string} alt={user?.name || "User"} />
									<AvatarFallback className='rounded-lg bg-indigo-600 text-white font-bold text-xs'>
										{user?.name?.substring(0, 2).toUpperCase() || "AD"}
									</AvatarFallback>
								</Avatar>
								{!isCollapsed && (
									<div className='flex items-center justify-between flex-1 min-w-0'>
										<div className='overflow-hidden text-left'>
											<p className='text-xs font-bold text-slate-900 truncate'>
												{user?.name || "Administrator"}
											</p>
											<p className='text-[10px] font-medium text-slate-500 truncate'>
												{user?.email || "admin@sisantri.com"}
											</p>
										</div>
										<ChevronsUpDown className='ml-2 size-4 text-slate-400 shrink-0' />
									</div>
								)}
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className='w-64 rounded-2xl p-2 shadow-premium border-slate-100' side='right' align='end' sideOffset={12}>
							<DropdownMenuLabel className='p-3 font-normal'>
								<div className='flex items-center gap-3'>
									<Avatar className='h-10 w-10 border-2 border-indigo-50'>
										<AvatarImage src={user?.profile?.avatar as string} alt={user?.name || "User"} />
										<AvatarFallback className='rounded-lg bg-indigo-600 text-white font-bold'>
											{user?.name?.substring(0, 2).toUpperCase() || "AD"}
										</AvatarFallback>
									</Avatar>
									<div className='grid flex-1 text-left leading-tight'>
										<span className='truncate font-bold text-slate-900'>{user?.name || "Administrator"}</span>
										<span className='truncate text-xs text-slate-500'>{user?.email || "admin@sisantri.com"}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator className='bg-slate-100' />
							<DropdownMenuGroup className='p-1'>
								<DropdownMenuItem className='rounded-xl focus:bg-indigo-50 focus:text-indigo-600 py-2.5' onClick={() => router.push("/profile")}>
									<User className='mr-2 h-4 w-4' />
									<span className='font-medium'>My Profile</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator className='bg-slate-100' />
							<DropdownMenuItem
								className='rounded-xl text-rose-600 focus:text-rose-700 focus:bg-rose-50 py-2.5 m-1'
								onClick={() => {
									logout();
									router.push("/login");
								}}
							>
								<LogOut className='mr-2 h-4 w-4' />
								<span className='font-medium'>Sign out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</aside>

			{/* Spacing for content */}
			<div className={cn("hidden md:block transition-all duration-300", isCollapsed ? "w-20" : "w-64")} />
		</>
	);
}
