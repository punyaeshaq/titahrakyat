import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentUser.id);
          const roles = data?.map((r) => r.role) ?? [];
          setIsAdmin(roles.includes("admin") || roles.includes("editor"));
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });

  const signOut = () => supabase.auth.signOut();

  return { user, isAdmin, loading, signIn, signUp, signOut };
}
