import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { BatchFormValues } from "../types/batch-schema";

export const useCreateBatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BatchFormValues) => {
      const response = await api.post("/api/batches", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
};

export const useUpdateBatchMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BatchFormValues) => {
      const response = await api.patch(`/api/batches/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["batch", id] });
    },
  });
};

export const useDeleteBatchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/batches/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
  });
};
