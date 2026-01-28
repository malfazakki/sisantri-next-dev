import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Role } from "../types/role-schema";

export const useRolesQuery = () => {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/api/roles");
      return response.data;
    },
  });
};

export const useRoleQuery = (id: string) => {
  return useQuery<Role>({
    queryKey: ["role", id],
    queryFn: async () => {
      const response = await api.get(`/api/roles/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
