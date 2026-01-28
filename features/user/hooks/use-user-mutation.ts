import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { InviteUserValues } from "../types/user-schema";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useInviteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteUserValues) => {
      const response = await api.post("/api/users/invite", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User invited successfully");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || "Failed to invite user");
    },
  });
};
