import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { UpdateAttendanceValues } from "../types/activity-schema";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { format } from "date-fns";

export const useUpdateActivityAttendanceMutation = (activityId: number | string | undefined) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: UpdateAttendanceValues) => {
			const response = await api.post(`/api/activities/${activityId}/attendance`, data);
			return response.data;
		},
		onSuccess: (_, variables) => {
			const formattedDate = format(variables.date, "yyyy-MM-dd");
			queryClient.invalidateQueries({ queryKey: ["activity-attendance", activityId, formattedDate] });
			toast.success("Attendance updated successfully");
		},
		onError: (error: AxiosError<{ error: string }>) => {
			toast.error(error.response?.data?.error || "Failed to update attendance");
		},
	});
};
