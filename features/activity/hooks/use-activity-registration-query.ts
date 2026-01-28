import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ActivityRegistration } from "../types/activity-schema";

export const useActivityRegistrationsQuery = (activityId: number | string | undefined) => {
	return useQuery<ActivityRegistration[]>({
		queryKey: ["activity-registrations", activityId],
		queryFn: async () => {
			const response = await api.get(`/api/activities/${activityId}/registrations`);
			return response.data;
		},
		enabled: !!activityId,
	});
};
