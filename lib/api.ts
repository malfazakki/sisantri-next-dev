import axios from 'axios';
import { useAuthStore } from '@/hooks/use-auth-store';

const api = axios.create({
	baseURL: '/',
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
	(config) => {
		// We can't use hooks directly here because this is not a React component
		// But Zustand store can be accessed outside of React
		const token = useAuthStore.getState().token;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add a response interceptor to handle specialized response structure
api.interceptors.response.use(
	(response) => {
		// If the response follows our global pattern, unwrap the data
		const resData = response.data as Record<string, unknown> | null | undefined;
		if (resData && resData.status === "success" && "data" in resData) {
			return {
				...response,
				data: resData.data,
				// We can attach the full original response metadata if needed
				_fullResponse: resData,
			};
		}
		return response;
	},
	(error) => {
		if (axios.isAxiosError(error)) {
			const response = error.response;

			if (response?.status === 401) {
				// Clear auth state on unauthorized error
				useAuthStore.getState().logout();
			}

			let errorMessage = "Terjadi kesalahan pada sistem";
			let errorDetails: unknown[] | undefined = undefined;
			let errorCode: number | undefined = undefined;

			if (response) {
				const body = response.data;

				// 1. Handle JSON Object Response
				if (body !== null && typeof body === 'object') {
					const data = body as Record<string, unknown>;

					// Probe for common error message keys
					if (typeof data.message === 'string') errorMessage = data.message;
					else if (typeof data.error === 'string') errorMessage = data.error;

					// Extract validation details or error codes
					if (Array.isArray(data.errors)) errorDetails = data.errors;
					if (typeof data.code === 'number' || typeof data.code === 'string') {
						errorCode = Number(data.code);
					}
				}
				// 2. Handle Plain Text Response (Avoid HTML)
				else if (typeof body === 'string' && !body.trim().startsWith('<')) {
					errorMessage = body;
				}
				// 3. Fallback to HTTP Status Mapping if body is unreadable (HTML/Empty)
				else {
					switch (response.status) {
						case 400: errorMessage = "Permintaan tidak valid"; break;
						case 403: errorMessage = "Akses ditolak (Forbidden)"; break;
						case 404: errorMessage = "Layanan tidak ditemukan"; break;
						case 422: errorMessage = "Data tidak valid (Validation Error)"; break;
						case 429: errorMessage = "Terlalu banyak permintaan, coba lagi nanti"; break;
						case 500: errorMessage = "Terjadi kesalahan internal pada server"; break;
						case 502:
						case 503:
						case 504: errorMessage = "Server sedang sibuk atau tidak merespon"; break;
						default: errorMessage = `Gagal melakukan permintaan (Status: ${response.status})`;
					}
				}
			} else if (error.request) {
				// Network Error (No response)
				errorMessage = "Gagal terhubung ke server. Periksa koneksi internet Anda.";
			} else {
				errorMessage = error.message;
			}

			const apiError = new Error(errorMessage) as Error & {
				errors?: unknown[];
				code?: number;
			};

			apiError.errors = errorDetails;
			apiError.code = errorCode;

			return Promise.reject(apiError);
		}

		return Promise.reject(error instanceof Error ? error : new Error("Ditemukan kesalahan sistem yang tidak terduga"));
	}
);

export default api;
