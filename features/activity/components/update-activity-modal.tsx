"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activitySchema, ActivityFormValues, Activity } from "../types/activity-schema";
import { useUpdateActivityMutation } from "../hooks/use-activity-mutation";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UpdateActivityModalProps {
	activity: Activity | null;
	isOpen: boolean;
	onClose: () => void;
}

export const UpdateActivityModal = ({ activity, isOpen, onClose }: UpdateActivityModalProps) => {
	const { mutate: updateActivity, isPending } = useUpdateActivityMutation(activity?.id || "");

	const form = useForm<ActivityFormValues>({
		resolver: zodResolver(activitySchema),
		defaultValues: {
			name: "",
		},
	});

	useEffect(() => {
		if (activity) {
			form.reset({
				name: activity.name,
			});
		}
	}, [activity, form]);

	const onSubmit = async (values: ActivityFormValues) => {
		updateActivity(values, {
			onSuccess: () => {
				onClose();
			},
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Update Activity</DialogTitle>
					<DialogDescription>Update the details of the activity.</DialogDescription>
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
										<Input placeholder='Religious Study' {...field} />
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
								{isPending ? "Updating..." : "Update"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
