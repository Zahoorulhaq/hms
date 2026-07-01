// lib/react-query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

// Custom Error Handling Function
const handleQueryError = (error: unknown): void => {
  // Customize how to handle query errors
  console.error('Query Error:', error);
};

const handleMutationError = (error: unknown): void => {
  // Customize how to handle mutation errors
  console.error('Mutation Error:', error);
};

// Default Query Configuration
const defaultQueryOptions = {
  retry: 2, // Retry failed queries 2 times
  staleTime: 0, // Data is considered fresh for 5 minutes
  cacheTime: 0, // Inactive queries are cached for 10 minutes
  refetchOnWindowFocus: false, // Do not refetch on window focus
  onError: handleQueryError, // Use custom error handling
};

// Default Mutation Configuration
const defaultMutationOptions = {
  retry: 1, // Retry failed mutations 1 time
  onError: handleMutationError, // Use custom error handling
};

// Query Cache to manage custom configurations globally
const queryCache = new QueryCache({
  onError: handleQueryError,
});

// Mutation Cache to manage custom configurations globally
const mutationCache = new MutationCache({
  onError: handleMutationError,
});

// Create QueryClient with custom configurations
const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: defaultQueryOptions,
    mutations: defaultMutationOptions,
  },
});

export default queryClient;
