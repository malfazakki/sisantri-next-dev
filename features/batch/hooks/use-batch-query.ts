import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Batch } from "../types/batch-schema";

export const useBatchesQuery = () => {
  return useQuery<Batch[]>({
    queryKey: ["batches"],
    queryFn: async () => {
      const response = await api.get("/api/batches");
      return response.data;
    },
  });
};

export const useBatchQuery = (id: string) => {
  return useQuery<Batch>({
    queryKey: ["batch", id],
    queryFn: async () => {
      const response = await api.get(`/api/batches/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
