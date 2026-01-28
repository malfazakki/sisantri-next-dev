import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Department } from "../types/department-schema";

export const useDepartmentsQuery = () => {
  return useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await api.get("/api/departments");
      return response.data;
    },
  });
};

export const useDepartmentQuery = (id: string) => {
  return useQuery<Department>({
    queryKey: ["department", id],
    queryFn: async () => {
      const response = await api.get(`/api/departments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
