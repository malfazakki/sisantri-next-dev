import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { LoginType } from "../types/login-schema";

const login = async (data: LoginType) => {
  const response = await axios.post("/api/auth/login", data);
  return response.data;
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
  });
};
