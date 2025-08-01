# React Query Migration Guide

## Overview
This guide documents how to migrate from manual `useEffect`-based data fetching to React Query (TanStack Query) for better request management, caching, and reliability.

## Benefits of React Query
1. **Automatic request deduplication** - Multiple components using the same hook won't trigger duplicate requests
2. **Built-in caching** - Data persists across component unmounts/remounts
3. **Automatic cleanup** - Cancelled requests when components unmount
4. **Smart refetching** - Refetch on window focus, network reconnect, etc.
5. **Loading/error states** - Consistent state management across the app
6. **Optimistic updates** - Update UI before server confirms changes

## Migration Pattern

### Step 1: Create a New React Query Hook

```typescript
// OLD: useSomeData.ts
import { useState, useEffect } from 'react';

export function useSomeData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData().then(setData).catch(setError).finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
```

```typescript
// NEW: useSomeDataQuery.ts
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/lib/stores/useUserStore';

async function fetchSomeData(userId: string) {
  // Your data fetching logic here
  const response = await supabase.from('table').select('*').eq('user_id', userId);
  if (response.error) throw response.error;
  return response.data;
}

export function useSomeDataQuery() {
  const user = useUserStore((state) => state.user);
  const isLoading = useUserStore((state) => state.isLoading);
  const userId = user?.id;

  const query = useQuery({
    queryKey: ['someData', userId], // Unique key for this query
    queryFn: () => fetchSomeData(userId!),
    enabled: !isLoading && !!userId, // Only run when ready
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  return query;
}

// Optional: Provide backward-compatible interface
export function useSomeData() {
  const query = useSomeDataQuery();
  return {
    data: query.data || null,
    loading: query.isLoading,
    error: query.error || null,
    refetch: query.refetch
  };
}
```

### Step 2: Update Components

```typescript
// No changes needed if you provided the backward-compatible interface!
const { data, loading, error } = useSomeData();
```

Or use the React Query interface directly:

```typescript
const { data, isLoading, error, refetch } = useSomeDataQuery();
```

## Example: Dashboard Data Migration

We migrated `useDashboardData` to `useDashboardDataQuery`:

1. **Created new hook** with React Query in `useDashboardDataQuery.ts`
2. **Maintained same interface** for easy migration
3. **Added deprecation notice** to old hook
4. **Updated imports** in components

## Best Practices

### 1. Query Keys
- Use descriptive, unique keys: `['resource', userId, filters]`
- Include all dependencies that affect the data

### 2. Stale Time vs Cache Time
- `staleTime`: How long data is considered fresh (no refetch needed)
- `gcTime`: How long to keep data in cache after last use

### 3. Error Handling
```typescript
retry: (failureCount, error) => {
  // Don't retry on 4xx errors (except 401)
  if (error.status >= 400 && error.status < 500 && error.status !== 401) {
    return false;
  }
  return failureCount < 3;
}
```

### 4. Auth State Changes
Listen for auth changes and invalidate queries:
```typescript
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'TOKEN_REFRESHED') {
      query.refetch();
    }
  });
  return () => authListener?.subscription.unsubscribe();
}, [query]);
```

## Hooks to Migrate

Priority order for migration:
1. ✅ `useDashboardData` → `useDashboardDataQuery` (DONE)
2. ⏳ Any other hooks using manual `useEffect` for data fetching
3. ⏳ Hooks that need request cancellation or deduplication

## Testing

After migration, test:
1. **Layout switching** - Data should persist when switching mobile/desktop
2. **Component remounting** - No duplicate requests
3. **Error states** - Proper error handling
4. **Loading states** - Smooth transitions
5. **Cache behavior** - Data available instantly on revisit

## Resources
- [React Query Docs](https://tanstack.com/query/latest)
- [Query Key Best Practices](https://tkdodo.eu/blog/effective-react-query-keys)
- [React Query Tips](https://tkdodo.eu/blog/practical-react-query)