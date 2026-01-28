import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Division } from "../types/division-schema";

export const useDivisionsQuery = () => {
  return useQuery<Division[]>({
    queryKey: ["divisions"],
    queryFn: async () => {
      const response = await api.get("/api/divisions");
      return response.data;
    },
  });
};

export const useDivisionQuery = (id: string) => {
  return useQuery<Division>({
    queryKey: ["division", id],
    queryFn: async () => {
      const response = await api.get(`/api/divisions/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
