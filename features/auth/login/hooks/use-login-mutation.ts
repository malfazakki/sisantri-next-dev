import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { LoginType } from "../types/login-schema";
import { useRouter } from "next/navigation";

const login = async (data: LoginType) => {
	const response = await axios.post("/api/auth/login", data);
	return response.data;
};

export const useLoginMutation = () => {
	const router = useRouter();

	return useMutation({
		mutationFn: login,
		onSuccess: (data, variables) => {
			console.log("Login Values:", variables);
			console.log("Response:", data);
			router.push("/");
		},
		onError: (error) => {
			console.error("Login error:", error);
			alert("Login failed. Please try again.");
		},
	});
};
