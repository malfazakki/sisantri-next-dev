import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { RegisterType } from "../types/register-schema";

const register = async (data: RegisterType) => {
	const response = await api.post("/api/auth/register", data);
	return response.data;
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: register,
  });
};
