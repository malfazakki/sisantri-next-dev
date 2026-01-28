"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
	{ name: "Division", href: "/division", icon: Layers },
	{ name: "Department", href: "/department", icon: Building2 },
	{ name: "Roles", href: "/roles", icon: ShieldCheck },
	{ name: "Users", href: "/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
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
					"fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 ease-in-out flex flex-col shadow-sm",
					isCollapsed ? "w-20 overflow-x-hidden" : "w-64",
					isMobileOpen ? "translate-x-0 w-64" : "max-md:-translate-x-full",
					"md:translate-x-0",
				)}
			>
				{/* Logo Section */}
				<div className='h-20 flex items-center px-6 border-b border-slate-50'>
					<div className='flex items-center gap-3 overflow-hidden'>
						<div className='w-8 h-8 rounded-lg bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-bold'>
							S
						</div>
						{!isCollapsed && (
							<span className='font-bold text-xl text-slate-800 tracking-tight whitespace-nowrap'>
								SiSantri
							</span>
						)}
					</div>
				</div>

				{/* Navigation Section */}
				<nav className='flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden'>
					{menuItems.map((item) => {
						const isActive = pathname === item.href;
						const Icon = item.icon;

						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setIsMobileOpen(false)}
								className={cn(
									"flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
									isActive
										? "bg-indigo-50 text-indigo-600"
										: "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
									isCollapsed && "justify-center",
								)}
							>
								<Icon
									size={22}
									className={cn(
										"flex-shrink-0 transition-transform group-hover:scale-110",
										isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600",
									)}
								/>

								{!isCollapsed && <span className='font-medium whitespace-nowrap'>{item.name}</span>}

								{/* Tooltip for collapsed state */}
								{isCollapsed && (
									<div className='absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap'>
										{item.name}
									</div>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Collapse Toggle (Desktop only) */}
				<div className='p-4 border-t border-slate-50 hidden md:block'>
					<button
						onClick={toggleSidebar}
						className='w-full h-10 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors'
					>
						{isCollapsed ? (
							<ChevronRight size={20} />
						) : (
							<div className='flex items-center gap-2'>
								<ChevronLeft size={20} />
								<span className='text-sm font-medium'>Collapse</span>
							</div>
						)}
					</button>
				</div>

				{/* User Profile Hook-up */}
				<div className='p-4 border-t border-slate-50'>
					<div
						className={cn(
							"flex items-center gap-3 p-2 rounded-xl bg-slate-50/50",
							isCollapsed && "justify-center",
						)}
					>
						<div className='w-8 h-8 rounded-full bg-slate-200 animate-pulse flex-shrink-0' />
						{!isCollapsed && (
							<div className='overflow-hidden'>
								<p className='text-sm font-semibold text-slate-800 truncate'>Administrator</p>
								<p className='text-xs text-slate-500 truncate'>admin@sisantri.com</p>
							</div>
						)}
					</div>
				</div>
			</aside>

			{/* Spacing for content */}
			<div className={cn("hidden md:block transition-all duration-300", isCollapsed ? "w-20" : "w-64")} />
		</>
  );
}
