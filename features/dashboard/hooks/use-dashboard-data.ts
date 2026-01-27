import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DashboardData } from "../types";

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await axios.get("/api/dashboard");
  return response.data;
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-data"],
    queryFn: fetchDashboardData,
  });
};
