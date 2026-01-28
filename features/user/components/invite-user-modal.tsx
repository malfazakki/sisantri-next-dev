"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInviteUserMutation } from "../hooks/use-user-mutation";
import { inviteUserSchema, InviteUserValues } from "../types/user-schema";
import { useDivisionsQuery } from "@/features/division";
import { useDepartmentsQuery } from "@/features/department";
import { useRolesQuery } from "@/features/role";
import { useCheckEmpId } from "../hooks/use-user-query";
import { useDebounce } from "@/hooks/use-debounce";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface InviteUserModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const InviteUserModal = ({ isOpen, onClose }: InviteUserModalProps) => {
	const { data: divisions, isLoading: isLoadingDivisions } = useDivisionsQuery();
	const { data: departments, isLoading: isLoadingDepartments } = useDepartmentsQuery();
	const { data: roles, isLoading: isLoadingRoles } = useRolesQuery();
	const { mutate: inviteUser, isPending } = useInviteUserMutation();

	const form = useForm<InviteUserValues>({
		resolver: zodResolver(inviteUserSchema),
		defaultValues: {
			fullName: "",
			empId: "",
			email: "",
			roleId: "",
			divisionId: "",
			departmentId: "",
		},
	});

	const selectedDivisionId = useWatch({
		control: form.control,
		name: "divisionId",
	});

	const empIdValue = useWatch({
		control: form.control,
		name: "empId",
	});

	const debouncedEmpId = useDebounce(empIdValue, 500);

	const { data: checkData, isFetching: isCheckingEmpId } = useCheckEmpId(debouncedEmpId);

	const isActuallyChecking = empIdValue !== debouncedEmpId || isCheckingEmpId;

	const filteredDepartments = departments?.filter(
		(dept) => dept.divisionId === selectedDivisionId
	);

	const onSubmit = async (values: InviteUserValues) => {
		inviteUser(values, {
			onSuccess: () => {
				form.reset();
				onClose();
			},
		});
	};

	const isLoadingData = isLoadingDivisions || isLoadingDepartments || isLoadingRoles;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Invite User</DialogTitle>
					<DialogDescription>
						Send an invitation to a new user. They will be assigned a default password.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
						<FormField
							control={form.control}
							name='fullName'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder='John Doe' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input placeholder='john.doe@example.com' type='email' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='empId'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Employee ID</FormLabel>
									<FormControl>
										<div className="relative">
											<Input placeholder='EMP-001' {...field} />
											{isActuallyChecking && (
												<div className="absolute right-2 top-2.5">
													<Loader2 className="h-4 w-4 animate-spin text-slate-500" />
												</div>
											)}
										</div>
									</FormControl>
									{empIdValue && !isActuallyChecking && checkData?.exists && (
										<p className="text-sm font-medium text-red-500">
											Employee ID already exists in this organization.
										</p>
									)}
									{empIdValue && !isActuallyChecking && !checkData?.exists && (
										<p className="text-sm font-medium text-green-600">
											Employee ID is available.
										</p>
									)}
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='roleId'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<FormControl>
										<select
											{...field}
											className='flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										>
											<option value='' disabled>
												Select a role
											</option>
											{roles?.map((role) => (
												<option key={role.id} value={role.id}>
													{role.name}
												</option>
											))}
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='grid grid-cols-2 gap-4'>
							<FormField
								control={form.control}
								name='divisionId'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Division</FormLabel>
										<FormControl>
											<select
												{...field}
												onChange={(e) => {
													field.onChange(e);
													form.setValue("departmentId", "");
												}}
												className='flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
											>
												<option value='' disabled>
													Select division
												</option>
												{divisions?.map((division) => (
													<option key={division.id} value={division.id}>
														{division.name}
													</option>
												))}
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='departmentId'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Department (Optional)</FormLabel>
										<FormControl>
											<select
												{...field}
												disabled={!selectedDivisionId}
												className='flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
											>
												<option value=''>- Select Department -</option>
												{filteredDepartments?.map((dept) => (
													<option key={dept.id} value={dept.id}>
														{dept.name}
													</option>
												))}
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className='flex justify-end space-x-2 pt-4'>
							<Button variant='outline' onClick={onClose} type='button'>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending || isLoadingData}>
								{isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Inviting...
									</>
								) : (
									"Invite User"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
