import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ActivityFormValues } from "../types/activity-schema";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useCreateActivityMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ActivityFormValues) => {
			const response = await api.post("/api/activities", data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			toast.success("Activity created successfully");
		},
		onError: (error: AxiosError<{ error: string }>) => {
			toast.error(error.response?.data?.error || "Failed to create activity");
		},
	});
};

export const useUpdateActivityMutation = (id: number | string) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ActivityFormValues) => {
			const response = await api.patch(`/api/activities/${id}`, data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			queryClient.invalidateQueries({ queryKey: ["activity", id] });
			toast.success("Activity updated successfully");
		},
		onError: (error: AxiosError<{ error: string }>) => {
			toast.error(error.response?.data?.error || "Failed to update activity");
		},
	});
};

export const useDeleteActivityMutation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number | string) => {
			const response = await api.delete(`/api/activities/${id}`);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			toast.success("Activity deleted successfully");
		},
		onError: (error: AxiosError<{ error: string }>) => {
			toast.error(error.response?.data?.error || "Failed to delete activity");
		},
	});
};
