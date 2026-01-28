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
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
