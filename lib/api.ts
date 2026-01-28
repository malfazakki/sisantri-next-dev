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
		if (response.data && response.data.status === "success" && "data" in response.data) {
			return {
				...response,
				data: response.data.data,
				// We can attach the full original response metadata if needed
				_fullResponse: response.data,
			};
		}
		return response;
	},
	(error) => {
		if (error.response?.status === 401) {
			// Clear auth state on unauthorized error
			useAuthStore.getState().logout();
		}
		
		// If the error follows our global pattern, pass the error message
		if (error.response?.data && error.response.data.status === "error") {
			const apiError = new Error(error.response.data.message || "An error occurred") as Error & {
				errors?: unknown[];
				code?: number;
			};
			apiError.errors = error.response.data.errors;
			apiError.code = error.response.data.code;
			return Promise.reject(apiError);
		}
		
		return Promise.reject(error);
	}
);

export default api;
