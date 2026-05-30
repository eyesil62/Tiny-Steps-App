// Hook to load and manage child profiles
import { useEffect } from 'react';
import { childService } from '../lib/children';
import { useAppStore } from '../stores/useAppStore';

export function useChildren(userId: string | null) {
  const { setChildren, setActiveChild, children } = useAppStore();

  useEffect(() => {
    if (!userId) return;

    async function load() {
      const { data, error } = await childService.getAll(userId!);
      if (error) { console.error('Failed to load children:', error); return; }
      if (data) {
        setChildren(data);
        // Auto-select first child if none selected
        if (data.length > 0) setActiveChild(data[0]);
      }
    }

    load();
  }, [userId]);

  return { children };
}
