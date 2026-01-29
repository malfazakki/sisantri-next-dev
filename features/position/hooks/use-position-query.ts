import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Position } from "../types/position-schema";

export const usePositionsQuery = () => {
  return useQuery<Position[]>({
    queryKey: ["positions"],
    queryFn: async () => {
      const response = await api.get("/api/positions");
      return response.data;
    },
  });
};

export const usePositionQuery = (id: string) => {
  return useQuery<Position>({
    queryKey: ["position", id],
    queryFn: async () => {
      const response = await api.get(`/api/positions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
