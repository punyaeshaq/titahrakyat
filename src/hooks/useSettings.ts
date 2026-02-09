import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';

export function useSettings() {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const data = await settingsApi.getAll();
            return data || {};
        },
        staleTime: 0, // Always fetch fresh settings works better for admin updates
    });
}
