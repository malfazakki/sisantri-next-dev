import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DepartmentFormValues } from "../types/department-schema";

export const useCreateDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepartmentFormValues) => {
      const response = await api.post("/api/departments", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useUpdateDepartmentMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepartmentFormValues) => {
      const response = await api.patch(`/api/departments/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["department", id] });
    },
  });
};

export const useDeleteDepartmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/departments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
