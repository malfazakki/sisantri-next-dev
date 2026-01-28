"use client";

import React from "react";

import { useAuthStore } from "@/hooks/use-auth-store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EditProfileModal } from "./components/EditProfileModal";
import { Button } from "@/components/ui/button";
import { Edit2, User, Mail, Shield, Building } from "lucide-react";

export function ProfileView() {
	const { user } = useAuthStore();
	const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

	if (!user) return null;

	return (
		<div className='p-6 space-y-8 animate-in fade-in duration-500'>
			<div className='flex items-center justify-between'>
				<div className='flex flex-col gap-2'>
					<h1 className='text-3xl font-bold tracking-tight text-slate-900'>My Profile</h1>
					<p className='text-slate-500'>View and manage your personal account details.</p>
				</div>
				<Button 
					onClick={() => setIsEditModalOpen(true)}
					variant="outline" 
					className='flex items-center gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'
				>
					<Edit2 className='w-4 h-4' />
					Edit Profile
				</Button>
			</div>

			<EditProfileModal 
				isOpen={isEditModalOpen} 
				onClose={() => setIsEditModalOpen(false)} 
			/>

			<div className='grid gap-6 md:grid-cols-12'>
				{/* Profile Overview Card */}
				<Card className='md:col-span-4 h-fit border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group'>
					<div className='h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative'>
						<div className='absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500' />
					</div>
					<CardContent className='pt-0 -mt-16 flex flex-col items-center relative z-10'>
						<div className='relative'>
							<div className='absolute inset-0 bg-white rounded-full scale-110 shadow-lg' />
							<Avatar className='h-32 w-32 border-4 border-white shadow-2xl relative'>
								<AvatarImage src={user.profile?.avatar || undefined} alt={user.name || "User"} />
								<AvatarFallback className='text-3xl font-bold bg-indigo-50 text-indigo-700'>
									{user.name?.substring(0, 2).toUpperCase() || "US"}
								</AvatarFallback>
							</Avatar>
						</div>
						
						<div className='mt-6 text-center space-y-1'>
							<h2 className='text-2xl font-bold text-slate-800'>{user.name || "Administrator"}</h2>
							<p className='text-slate-500 flex items-center justify-center gap-2'>
								<Mail className='w-4 h-4' />
								{user.email}
							</p>
						</div>

						<div className='mt-6 flex flex-wrap justify-center gap-2'>
							{user.roles?.map((r, i) => (
								<Badge key={i} variant="secondary" className='bg-indigo-50 text-indigo-700 border-indigo-100 px-4 py-1 rounded-full'>
									{r.role.name}
								</Badge>
							))}
						</div>
					</CardContent>
					<div className='border-t border-slate-50 p-6 bg-slate-50/50'>
						<div className='grid grid-cols-2 gap-4 text-center'>
							<div className='space-y-1'>
								<p className='text-xs text-slate-400 uppercase font-bold tracking-widest'>Status</p>
								<p className='text-sm font-semibold text-emerald-600 flex items-center justify-center gap-1'>
									<span className='w-2 h-2 rounded-full bg-emerald-500 animate-pulse' />
									Active
								</p>
							</div>
							<div className='space-y-1'>
								<p className='text-xs text-slate-400 uppercase font-bold tracking-widest'>Joined</p>
								<p className='text-sm font-semibold text-slate-700'>Jan 2024</p>
							</div>
						</div>
					</div>
				</Card>

				{/* Details Sections */}
				<div className='md:col-span-8 space-y-6'>
					<Card className='border-slate-200/60 shadow-lg shadow-slate-100/50'>
						<CardHeader className='pb-3'>
							<div className='flex items-center gap-3'>
								<div className='p-2 bg-indigo-50 rounded-lg text-indigo-600'>
									<User className='w-5 h-5' />
								</div>
								<div>
									<CardTitle className='text-lg'>Account Information</CardTitle>
									<CardDescription>Primary details associated with your account</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className='grid gap-6 pt-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
								<div className='space-y-2'>
									<p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Full Name</p>
									<p className='text-slate-800 font-medium pb-2 border-b border-slate-100 flex items-center gap-3'>
										{user.name || "Not set"}
									</p>
								</div>
								<div className='space-y-2'>
									<p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Email Address</p>
									<p className='text-slate-800 font-medium pb-2 border-b border-slate-100 flex items-center gap-3'>
										{user.email}
									</p>
								</div>
								<div className='space-y-2'>
									<p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>User Identification</p>
									<p className='text-slate-600 font-mono text-sm pb-2 border-b border-slate-100 flex items-center gap-3'>
										{user.id}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className='border-slate-200/60 shadow-lg shadow-slate-100/50'>
						<CardHeader className='pb-3'>
							<div className='flex items-center gap-3'>
								<div className='p-2 bg-violet-50 rounded-lg text-violet-600'>
									<Building className='w-5 h-5' />
								</div>
								<div>
									<CardTitle className='text-lg'>Organization Details</CardTitle>
									<CardDescription>Your role and organization context</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className='pt-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
								<div className='space-y-2'>
									<p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Organization</p>
									<div className='flex items-center gap-3 text-slate-800 font-medium pb-2 border-b border-slate-100'>
										<span className='w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs'>S</span>
										{user.organization?.name || "Main Organization"}
									</div>
								</div>
								<div className='space-y-2'>
									<p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Current Role</p>
									<div className='flex items-center gap-3 text-slate-800 font-medium pb-2 border-b border-slate-100'>
										<div className='p-1 bg-amber-50 rounded text-amber-600'>
											<Shield className='w-4 h-4' />
										</div>
										{user.roles?.[0]?.role.name || "Member"}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
