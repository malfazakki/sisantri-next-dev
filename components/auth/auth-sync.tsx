'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useRouter, usePathname } from 'next/navigation';

export function AuthSync() {
  const token = useAuthStore((state) => state.token);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated) return;

    // Sync token to cookie
    if (token) {
      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
      
      // If we are on login/register page but have a token, redirect to dashboard
      if (pathname === '/login' || pathname === '/register') {
        router.push('/dashboard');
      }
    } else {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // If we are NOT on login/register page and don't have a token, redirect to login
      if (pathname !== '/login' && pathname !== '/register') {
        router.push('/login');
      }
    }
  }, [token, pathname, router, _hasHydrated]);

  return null;
}
