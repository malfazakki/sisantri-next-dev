import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { ProfileValues } from "../types/profile-schema";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuthStore } from "@/hooks/use-auth-store";

export const useUpdateProfileMutation = () => {
	const queryClient = useQueryClient();
	const setAuth = useAuthStore((state) => state.setAuth);
	const token = useAuthStore((state) => state.token);

	return useMutation({
		mutationFn: async (data: ProfileValues) => {
			const response = await api.patch("/api/profile", data);
			return response.data;
		},
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ["profile"] });
			
			// Update auth store with new user data
			if (token && response.data) {
				setAuth(token, response.data);
			}
			
			toast.success("Profile updated successfully");
		},
		onError: (error: AxiosError<{ error: string }>) => {
			toast.error(error.response?.data?.error || "Failed to update profile");
		},
	});
};
