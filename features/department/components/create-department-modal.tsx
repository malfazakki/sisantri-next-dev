"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateDepartmentMutation } from "../hooks/use-department-mutation";
import { useDivisionsQuery } from "@/features/division";
import { departmentSchema, DepartmentFormValues } from "../types/department-schema";

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

interface CreateDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDepartmentModal = ({
  isOpen,
  onClose,
}: CreateDepartmentModalProps) => {
  const { data: divisions, isLoading: isLoadingDivisions } = useDivisionsQuery();
  const { mutate: createDepartment, isPending } = useCreateDepartmentMutation();

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      divisionId: "",
    },
  });

  const onSubmit = async (values: DepartmentFormValues) => {
    createDepartment(values, {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
          <DialogDescription>
            Add a new department to a division.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="divisionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Division</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select a division</option>
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
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isLoadingDivisions}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
