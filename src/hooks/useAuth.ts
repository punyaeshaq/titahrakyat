import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";

// User type compatible with existing components
interface User {
  id: string | number;
  email: string;
  name?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        // Check for stored user first
        const storedUser = authApi.getStoredUser();

        if (storedUser && authApi.isAuthenticated()) {
          if (isMounted) {
            setUser(storedUser);
            // Check actual role from stored user
            const role = storedUser.role || '';
            setIsAdmin(role === 'admin' || role === 'editor');
          }

          // Verify token is still valid by calling /auth/me
          try {
            const verifiedUser = await authApi.me();
            if (isMounted) {
              setUser(verifiedUser);
              const role = verifiedUser.role || '';
              setIsAdmin(role === 'admin' || role === 'editor');
              localStorage.setItem('user', JSON.stringify(verifiedUser));
            }
          } catch {
            // Token invalid, clear auth
            if (isMounted) {
              setUser(null);
              setIsAdmin(false);
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
            }
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      const role = data.user?.role || '';
      setIsAdmin(role === 'admin' || role === 'editor');
      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.response?.data?.message || error.message || 'Login failed'
        }
      };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const data = await authApi.register(
        name || email.split('@')[0],
        email,
        password,
        password
      );
      setUser(data.user);
      const role = data.user?.role || '';
      setIsAdmin(role === 'admin' || role === 'editor');
      return { data, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.response?.data?.message || error.message || 'Registration failed'
        }
      };
    }
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors, still clear local state
    }
    setUser(null);
    setIsAdmin(false);
  };

  return { user, isAdmin, loading, signIn, signUp, signOut };
}

