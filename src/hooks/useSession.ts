import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/useAppStore';

export function useSession() {
  const setLoggedIn = useAppStore((s) => s.setLoggedIn);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(session?.user?.id ?? null);
      setSessionReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { sessionReady };
}
