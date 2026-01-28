import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Activity } from "../types/activity-schema";

export const useActivitiesQuery = () => {
	return useQuery<Activity[]>({
		queryKey: ["activities"],
		queryFn: async () => {
			const response = await api.get("/api/activities");
			return response.data;
		},
	});
};

export const useActivityQuery = (id: number | string) => {
	return useQuery<Activity>({
		queryKey: ["activity", id],
		queryFn: async () => {
			const response = await api.get(`/api/activities/${id}`);
			return response.data;
		},
		enabled: !!id,
	});
};
