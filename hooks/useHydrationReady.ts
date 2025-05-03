import { useUserStore } from '@/store/UserStore';
import { useStoreHydrated } from '@/store/ToDo';
import { useHabitStore } from '@/store/HabitStore';

export const useHydrationReady = (): boolean => {
  const userHydrated = useUserStore((s: any) => s.hydrated);
  const projectHydrated = useStoreHydrated();
  const habitHydrated = useHabitStore((s: any) => s.hydrated);

  return userHydrated && projectHydrated && habitHydrated;
}; 