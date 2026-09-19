import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildSicilyDemo } from "../data/demoData";
import { localDb } from "../services/localDb";
import { isSupabaseConfigured, supabase } from "../services/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = null;

    async function init() {
      try {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (mounted) setUser(data.session?.user ?? null);
          const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) setUser(session?.user ?? null);
          });
          unsubscribe = () => listener.subscription.unsubscribe();
        } else {
          localDb.seedIfEmpty(buildSicilyDemo);
          if (mounted) setUser(localDb.getSession());
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const login = useCallback(
    async ({ email, password }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
        showToast("Welcome back!");
        return data.user;
      }
      const sessionUser = localDb.login({ email, password });
      setUser(sessionUser);
      showToast("Welcome back!");
      return sessionUser;
    },
    [showToast]
  );

  const register = useCallback(
    async ({ email, password, fullName }) => {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setUser(data.user);
        showToast("Account created!");
        return data.user;
      }
      const sessionUser = localDb.register({ email, password, fullName });
      setUser(sessionUser);
      showToast("Account created!");
      return sessionUser;
    },
    [showToast]
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localDb.logout();
    }
    setUser(null);
    showToast("Signed out", "info");
  }, [showToast]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      toast,
      showToast,
      isDemoMode: !isSupabaseConfigured,
      displayName: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Traveler",
    }),
    [user, loading, login, register, logout, toast, showToast]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
