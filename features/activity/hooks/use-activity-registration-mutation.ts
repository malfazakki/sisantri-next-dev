import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { AssignUsersValues } from "../types/activity-schema";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useAssignUsersMutation = (activityId: number | string | undefined) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: AssignUsersValues) => {
			const response = await api.post(`/api/activities/${activityId}/registrations`, data);
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activities"] });
			queryClient.invalidateQueries({ queryKey: ["activity-registrations", activityId] });
			toast.success("Users assigned successfully");
		},
		onError: (error: AxiosError<{ error: string }>) => {
			toast.error(error.response?.data?.error || "Failed to assign users");
		},
	});
};
