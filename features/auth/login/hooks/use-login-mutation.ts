import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { LoginType } from "../types/login-schema";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";

const login = async (data: LoginType) => {
	const response = await api.post("/api/auth/login", data);
	return response.data;
};

export const useLoginMutation = () => {
	const router = useRouter();
	const setAuth = useAuthStore((state) => state.setAuth);

	return useMutation({
		mutationFn: login,
		onSuccess: (data, variables) => {
			console.log("Login Values:", variables);
			console.log("Response:", data);

			if (data.token && data.user) {
				setAuth(data.token, data.user);
			}

			router.push("/");
		},
		onError: (error) => {
			console.error("Login error:", error);
			alert("Login failed. Please try again.");
		},
	});
};
