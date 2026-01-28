"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleSchema, RoleFormValues } from "../types/role-schema";
import { useCreateRoleMutation } from "../hooks/use-role-mutation";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CreateRoleModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateRoleModal = ({ isOpen, onClose }: CreateRoleModalProps) => {
	const { mutate: createRole, isPending } = useCreateRoleMutation();

	const form = useForm<RoleFormValues>({
		resolver: zodResolver(roleSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	const onSubmit = async (values: RoleFormValues) => {
		createRole(values, {
			onSuccess: () => {
				form.reset();
				onClose();
			},
			onError: (error) => {
				console.error(error);
			},
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Create Role</DialogTitle>
					<DialogDescription>Add a new role to system.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder='e.g. Admin, Teacher' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='description'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea 
											placeholder='Role description (optional)' 
											className="resize-none"
											{...field} 
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className='flex justify-end space-x-2 pt-4'>
							<Button variant='outline' onClick={onClose} type='button'>
								Cancel
							</Button>
							<Button type='submit' disabled={isPending}>
								{isPending ? "Creating..." : "Create"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
