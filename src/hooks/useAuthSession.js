import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAuthSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    }
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}
