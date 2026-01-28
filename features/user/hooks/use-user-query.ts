import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { User } from "../types/user-schema";

export const useUsersQuery = () => {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/api/users");
      return response.data;
    },
  });
};

export const useCheckEmpId = (empId: string) => {
	return useQuery({
		queryKey: ["check-emp-id", empId],
		queryFn: async () => {
			if (!empId) return { exists: false };
			const response = await api.get(`/api/users/check-emp-id?empId=${empId}`);
			return response.data as { exists: boolean };
		},
		enabled: empId.length > 0,
	});
};
