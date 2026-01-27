import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { RegisterType } from "../types/register-schema";

const register = async (data: RegisterType) => {
  const response = await axios.post("/api/auth/register", data);
  return response.data;
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: register,
  });
};
