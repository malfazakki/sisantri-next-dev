import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
	id: string;
	email: string;
	name?: string | null;
	organizationId?: string | null;
	profile?: {
		id: string;
		empId: string;
		fullName: string;
		avatar?: string | null;
		divisionId?: string | null;
		departmentId?: string | null;
		division?: {
			id: string;
			name: string;
		} | null;
		department?: {
			id: string;
			name: string;
		} | null;
	} | null;
	roles?: {
		role: {
			name: string;
		};
	}[];
	organization?: {
		id: string;
		name: string;
	} | null;
}

interface AuthState {
	token: string | null;
	user: User | null;
	isAuthenticated: boolean;
	_hasHydrated: boolean;
	setHasHydrated: (state: boolean) => void;
	setAuth: (token: string, user: User) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			user: null,
			isAuthenticated: false,
			_hasHydrated: false,
			setHasHydrated: (state) => set({ _hasHydrated: state }),
			setAuth: (token, user) => {
				if (typeof window !== "undefined") {
					document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
				}
				set({ token, user, isAuthenticated: true });
			},
			logout: () => {
				if (typeof window !== "undefined") {
					document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
				}
				set({ token: null, user: null, isAuthenticated: false });
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
			onRehydrateStorage: () => (state) => {
				state?.setHasHydrated(true);
			},
		},
	),
);
