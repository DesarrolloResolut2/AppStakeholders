import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });

        // Manejar errores 401 de manera silenciosa retornando null
        if (res.status === 401) {
          return null;
        }

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }
          throw new Error(`${res.status}: ${await res.text()}`);
        }

        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
      onError: (error) => {
        // Silenciar errores 401 y solo mostrar otros errores
        if (error instanceof Error && !error.message.includes('401')) {
          console.error('Mutation error:', error);
        }
      }
    }
  },
});