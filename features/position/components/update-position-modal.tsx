"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { positionSchema, PositionFormValues, Position } from "../types/position-schema";
import { useUpdatePositionMutation } from "../hooks/use-position-mutation";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface UpdatePositionModalProps {
	position: Position | null;
	isOpen: boolean;
	onClose: () => void;
}

export const UpdatePositionModal = ({ position, isOpen, onClose }: UpdatePositionModalProps) => {
	const { mutate: updatePosition, isPending } = useUpdatePositionMutation(position?.id || "");

	const form = useForm<PositionFormValues>({
		resolver: zodResolver(positionSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	useEffect(() => {
		if (position) {
			form.reset({
				name: position.name,
				description: position.description || "",
			});
		}
	}, [position, form]);

	const onSubmit = async (values: PositionFormValues) => {
		updatePosition(values, {
			onSuccess: () => {
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
					<DialogTitle>Update Position</DialogTitle>
					<DialogDescription>Modify the position details.</DialogDescription>
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
										<Input placeholder='e.g. Manager, Staff' {...field} />
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
											placeholder='Position description (optional)' 
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
								{isPending ? "Updating..." : "Update"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
