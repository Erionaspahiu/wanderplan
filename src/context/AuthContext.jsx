import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildSicilyDemo } from "../data/demoData";
import { localDb } from "../services/localDb";
import { isSupabaseConfigured, supabase } from "../services/supabase";
import { useLanguage } from "./LanguageContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { t } = useLanguage();
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
        showToast(t("auth.welcomeBackToast"));
        return data.user;
      }
      const sessionUser = localDb.login({ email, password });
      setUser(sessionUser);
      showToast(t("auth.welcomeBackToast"));
      return sessionUser;
    },
    [showToast, t]
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
        showToast(t("auth.accountCreatedToast"));
        return data.user;
      }
      const sessionUser = localDb.register({ email, password, fullName });
      setUser(sessionUser);
      showToast(t("auth.accountCreatedToast"));
      return sessionUser;
    },
    [showToast, t]
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localDb.logout();
    }
    setUser(null);
    showToast(t("auth.signedOutToast"), "info");
  }, [showToast, t]);

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
