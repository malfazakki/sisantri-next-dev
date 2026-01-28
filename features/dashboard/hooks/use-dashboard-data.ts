import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { DashboardData } from "../types";

const fetchDashboardData = async (): Promise<DashboardData> => {
	const response = await api.get("/api/dashboard");
	return response.data;
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
  });
};
