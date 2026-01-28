"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema, ProfileValues } from "../types/profile-schema";
import { useUpdateProfileMutation } from "../hooks/use-profile-mutation";
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
import { useAuthStore } from "@/hooks/use-auth-store";

interface EditProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
	const { user } = useAuthStore();
	const mutation = useUpdateProfileMutation();

	const form = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			fullName: user?.name || "",
			avatar: user?.profile?.avatar || "",
		},
	});

	useEffect(() => {
		if (isOpen && user) {
			form.reset({
				fullName: user.name || "",
				avatar: user.profile?.avatar || "",
			});
		}
	}, [isOpen, user, form]);

	const onSubmit = async (values: ProfileValues) => {
		await mutation.mutateAsync(values);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you&apos;re done.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 pt-4'>
						<FormField
							control={form.control}
							name='fullName'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input placeholder='Enter your full name' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='avatar'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Avatar URL</FormLabel>
									<FormControl>
										<Input placeholder='Enter image URL' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className='flex justify-end gap-3 pt-4'>
							<Button type='button' variant='outline' onClick={onClose}>
								Cancel
							</Button>
							<Button type='submit' disabled={mutation.isPending} className='bg-indigo-600 hover:bg-indigo-700'>
								{mutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								Save Changes
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
