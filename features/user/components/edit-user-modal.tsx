"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUserMutation } from "../hooks/use-user-mutation";
import { updateUserSchema, UpdateUserValues, User } from "../types/user-schema";
import { useDivisionsQuery } from "@/features/division";
import { useDepartmentsQuery } from "@/features/department";
import { useRolesQuery } from "@/features/role";
import { usePositionsQuery } from "@/features/position";
import { useCheckEmpId } from "../hooks/use-user-query";
import { useDebounce } from "@/hooks/use-debounce";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface EditUserModalProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
}

export const EditUserModal = ({ user, isOpen, onClose }: EditUserModalProps) => {
	const { data: divisions, isLoading: isLoadingDivisions } = useDivisionsQuery();
	const { data: departments, isLoading: isLoadingDepartments } = useDepartmentsQuery();
	const { data: roles, isLoading: isLoadingRoles } = useRolesQuery();
	const { data: positions, isLoading: isLoadingPositions } = usePositionsQuery();
	const { mutate: updateUser, isPending } = useUpdateUserMutation(user?.id || "");

	const form = useForm<UpdateUserValues>({
		resolver: zodResolver(updateUserSchema),
		defaultValues: {
			fullName: "",
			empId: "",
			email: "",
			roleId: "",
			divisionId: "",
			departmentId: "",
			positionId: "",
			gender: "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				fullName: user.profile?.fullName || "",
				empId: user.profile?.empId || "",
				email: user.email || "",
				roleId: user.roles[0]?.role.id || "",
				divisionId: user.profile?.division?.id || "",
				departmentId: user.profile?.department?.id || "",
				positionId: user.profile?.position?.id || "",
				gender: user.profile?.gender || "",
			});
		}
	}, [user, form]);

	const selectedDivisionId = useWatch({
		control: form.control,
		name: "divisionId",
	});

	const empIdValue = useWatch({
		control: form.control,
		name: "empId",
	});

	const debouncedEmpId = useDebounce(empIdValue, 500);

	const { data: checkData, isFetching: isCheckingEmpId } = useCheckEmpId(debouncedEmpId || "", user?.id);

	const isActuallyChecking = empIdValue !== debouncedEmpId || isCheckingEmpId;

	const filteredDepartments = departments?.filter((dept) => dept.divisionId === selectedDivisionId);

	const onSubmit = async (values: UpdateUserValues) => {
		const formattedValues = {
			...values,
			departmentId: values.departmentId === "" ? null : values.departmentId,
			positionId: values.positionId === "" ? null : values.positionId,
		};
		updateUser(formattedValues as UpdateUserValues, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	const isLoadingData = isLoadingDivisions || isLoadingDepartments || isLoadingRoles || isLoadingPositions;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[500px]'>
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>Update user information, role, division and department.</DialogDescription>
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
										<div className='relative'>
											<Input placeholder='EMP-001' {...field} />
											{isActuallyChecking && (
												<div className='absolute right-2 top-2.5'>
													<Loader2 className='h-4 w-4 animate-spin text-slate-500' />
												</div>
											)}
										</div>
									</FormControl>
									{empIdValue &&
										empIdValue !== user?.profile?.empId &&
										!isActuallyChecking &&
										checkData?.exists && (
											<p className='text-sm font-medium text-red-500'>
												Employee ID already exists in this organization.
											</p>
										)}
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='gender'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Gender</FormLabel>
									<FormControl>
										<select
											{...field}
											className='flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										>
											<option value='' disabled>
												Select gender
											</option>
											<option value='IKHWAN'>IKHWAN</option>
											<option value='AKHWAT'>AKHWAT</option>
										</select>
									</FormControl>
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
						<FormField
							control={form.control}
							name='positionId'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Position (Optional)</FormLabel>
									<FormControl>
										<select
											{...field}
											className='flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
										>
											<option value=''>- Select Position -</option>
											{positions?.map((position) => (
												<option key={position.id} value={position.id}>
													{position.name}
												</option>
											))}
										</select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end space-x-2 pt-4'>
							<Button variant='outline' onClick={onClose} type='button'>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending || isLoadingData}>
								{isPending ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Updating...
									</>
								) : (
									"Update User"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
