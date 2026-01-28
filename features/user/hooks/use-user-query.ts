import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaginatedUserResponse } from "../types/user-schema";

export interface UserQueryParams {
	page?: number;
	limit?: number;
	search?: string;
	divisionId?: string;
	departmentId?: string;
	roleId?: string;
}

export const useUsersQuery = (params: UserQueryParams = {}) => {
	return useQuery<PaginatedUserResponse>({
		queryKey: ["users", params],
		queryFn: async () => {
			const response = await api.get("/api/users", { params });
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
