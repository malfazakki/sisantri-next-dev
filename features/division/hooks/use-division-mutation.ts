import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { DivisionFormValues } from "../types/division-schema";

export const useCreateDivisionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DivisionFormValues) => {
      const response = await api.post("/api/divisions", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
};

export const useUpdateDivisionMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DivisionFormValues) => {
      const response = await api.patch(`/api/divisions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      queryClient.invalidateQueries({ queryKey: ["division", id] });
    },
  });
};

export const useDeleteDivisionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/divisions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
};
