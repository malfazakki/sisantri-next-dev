"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activitySchema, ActivityFormValues } from "../types/activity-schema";
import { useCreateActivityMutation } from "../hooks/use-activity-mutation";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateActivityModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateActivityModal = ({ isOpen, onClose }: CreateActivityModalProps) => {
	const { mutate: createActivity, isPending } = useCreateActivityMutation();

	const form = useForm<ActivityFormValues>({
		resolver: zodResolver(activitySchema),
		defaultValues: {
			name: "",
		},
	});

	const onSubmit = async (values: ActivityFormValues) => {
		createActivity(values, {
			onSuccess: () => {
				form.reset();
				onClose();
			},
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[425px]'>
				<DialogHeader>
					<DialogTitle>Create Activity</DialogTitle>
					<DialogDescription>Add a new activity to your organization.</DialogDescription>
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
								{isPending ? "Creating..." : "Create"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
