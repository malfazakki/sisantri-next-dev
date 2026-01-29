import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { PositionFormValues } from "../types/position-schema";

export const useCreatePositionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PositionFormValues) => {
      const response = await api.post("/api/positions", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
};

export const useUpdatePositionMutation = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PositionFormValues) => {
      const response = await api.patch(`/api/positions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["position", id] });
    },
  });
};

export const useDeletePositionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/positions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
    },
  });
};
