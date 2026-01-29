import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Attendance } from "../types/activity-schema";
import { format } from "date-fns";

export const useActivityAttendanceQuery = (activityId: number | string | undefined, date: Date | undefined) => {
	return useQuery<Attendance[]>({
		queryKey: ["activity-attendance", activityId, date ? format(date, "yyyy-MM-dd") : null],
		queryFn: async () => {
			if (!date) return [];
			const formattedDate = format(date, "yyyy-MM-dd");
			const response = await api.get(`/api/activities/${activityId}/attendance?date=${formattedDate}`);
			return response.data;
		},
		enabled: !!activityId && !!date,
	});
};
