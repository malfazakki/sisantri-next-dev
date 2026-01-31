"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { batchSchema, BatchFormValues, Batch } from "../types/batch-schema";
import { useUpdateBatchMutation } from "../hooks/use-batch-mutation";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface UpdateBatchModalProps {
	batch: Batch | null;
	isOpen: boolean;
	onClose: () => void;
}

export const UpdateBatchModal = ({ batch, isOpen, onClose }: UpdateBatchModalProps) => {
	const { mutate: updateBatch, isPending } = useUpdateBatchMutation(batch?.id || "");

	const form = useForm<BatchFormValues>({
		resolver: zodResolver(batchSchema),
		defaultValues: {
			name: "",
			year: "",
			description: "",
		},
	});

	useEffect(() => {
		if (batch) {
			form.reset({
				name: batch.name,
				year: batch.year,
				description: batch.description || "",
			});
		}
	}, [batch, form]);

	const onSubmit = async (values: BatchFormValues) => {
		updateBatch(values, {
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
					<DialogTitle>Update Batch</DialogTitle>
					<DialogDescription>Modify the batch details.</DialogDescription>
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
										<Input placeholder='e.g. Batch 2024, Angkatan VII' {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name='year'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Year</FormLabel>
									<FormControl>
										<Input placeholder='e.g. 2024' {...field} />
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
											placeholder='Batch description (optional)' 
											className="resize-none"
											{...field} 
											value={field.value || ""}
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
