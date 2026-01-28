import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export const useProfileQuery = () => {
	return useQuery({
		queryKey: ["profile"],
		queryFn: async () => {
			const response = await api.get("/api/profile");
			return response.data;
		},
	});
};
