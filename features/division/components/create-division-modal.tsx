"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateDivisionMutation } from "../hooks/use-division-mutation";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
});

interface CreateDivisionModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateDivisionModal = ({ isOpen, onClose }: CreateDivisionModalProps) => {
	const { mutate: createDivision, isPending } = useCreateDivisionMutation();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
		},
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		createDivision(values, {
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
					<DialogTitle>Create Division</DialogTitle>
					<DialogDescription>Add a new division to your organization.</DialogDescription>
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
										<Input placeholder='IT Division' {...field} />
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
