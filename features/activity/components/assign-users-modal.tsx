"use client";

import { useState } from "react";
import { Search, Loader2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsersQuery } from "@/features/user/hooks/use-user-query";
import { useActivityRegistrationsQuery } from "../hooks/use-activity-registration-query";
import { useAssignUsersMutation } from "../hooks/use-activity-registration-mutation";
import { Activity, ActivityRegistration } from "../types/activity-schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AssignUsersModalProps {
	activity: Activity | null;
	isOpen: boolean;
	onClose: () => void;
}

export const AssignUsersModal = ({ activity, isOpen, onClose }: AssignUsersModalProps) => {
	const [search, setSearch] = useState("");
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const { data: userData, isLoading: isLoadingUsers } = useUsersQuery({ limit: 100 });
	const { data: registrations, isLoading: isLoadingRegistrations } = useActivityRegistrationsQuery(activity?.id);
	const { mutate: assignUsers, isPending: isAssigning } = useAssignUsersMutation(activity?.id);

	const [prevRegistrations, setPrevRegistrations] = useState<ActivityRegistration[] | undefined>(undefined);


	if (isOpen && registrations !== prevRegistrations) {
		setPrevRegistrations(registrations);
		if (registrations) {
			setSelectedIds(registrations.map((r) => r.profileId));
		}
	}

	const toggleUser = (profileId: string) => {
		setSelectedIds((prev) =>
			prev.includes(profileId) ? prev.filter((id) => id !== profileId) : [...prev, profileId]
		);
	};

	const onConfirm = () => {
		assignUsers(
			{ profileIds: selectedIds },
			{
				onSuccess: () => {
					onClose();
				},
			}
		);
	};

	const filteredUsers = userData?.users?.filter((user) => {
		const fullName = user.profile?.fullName || "";
		const email = user.email || "";
		return (
			fullName.toLowerCase().includes(search.toLowerCase()) ||
			email.toLowerCase().includes(search.toLowerCase())
		);
	});

	const isLoading = isLoadingUsers || isLoadingRegistrations;

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setSearch("");
			setSelectedIds([]);
			setPrevRegistrations(undefined);
			onClose();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className='sm:max-w-[500px] gap-0 p-0 overflow-hidden'>
				<DialogHeader className='p-6 pb-0'>
					<DialogTitle>Assign Users</DialogTitle>
					<DialogDescription>
						Select users to participate in <span className='font-semibold text-zinc-900 dark:text-zinc-100'>{activity?.name}</span>.
					</DialogDescription>
				</DialogHeader>

				<div className='p-6 space-y-4'>
					<div className='relative'>
						<Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400' />
						<Input
							placeholder='Search users...'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className='pl-10 h-10'
						/>
					</div>

					<div className='max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar'>
						{isLoading ? (
							<div className='flex flex-col items-center justify-center py-20 gap-3'>
								<Loader2 className='w-8 h-8 animate-spin text-zinc-400' />
								<p className='text-sm text-zinc-500'>Loading data...</p>
							</div>
						) : filteredUsers?.length === 0 ? (
							<div className='text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed'>
								<p className='text-zinc-500 text-sm'>No users found matching your search.</p>
							</div>
						) : (
							filteredUsers?.map((user) => {
								if (!user.profile) return null;
								const isSelected = selectedIds.includes(user.profile.id);
								return (
									<div
										key={user.id}
										onClick={() => toggleUser(user.profile!.id)}
										className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
											isSelected
												? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
												: "border-zinc-100 hover:border-zinc-200 dark:border-zinc-800 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
										}`}
									>
										<Avatar className='h-10 w-10 border shadow-sm'>
											<AvatarFallback className='bg-zinc-100 text-zinc-600 font-medium text-xs dark:bg-zinc-800 dark:text-zinc-400'>
												{user.profile.fullName.substring(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className='flex-1 min-w-0'>
											<p className='text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate'>
												{user.profile.fullName}
											</p>
											<p className='text-xs text-zinc-500 truncate'>{user.email}</p>
										</div>
										<div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
											isSelected 
												? "bg-blue-500 border-blue-500 scale-110" 
												: "border-zinc-200 dark:border-zinc-700"
										}`}>
											{isSelected && <Check className='w-3 h-3 text-white' />}
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>

				<div className='flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t'>
					<p className='text-xs text-zinc-500'>
						<span className='font-semibold text-zinc-900 dark:text-zinc-100'>{selectedIds.length}</span> users selected
					</p>
					<div className='flex gap-2 font-medium'>
						<Button variant='outline' onClick={onClose} type='button' className='px-6'>
							Cancel
						</Button>
						<Button onClick={onConfirm} disabled={isAssigning} className='px-6'>
							{isAssigning ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};
