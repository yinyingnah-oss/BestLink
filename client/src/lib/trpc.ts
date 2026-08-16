import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/routers';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/trpc';

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,
      // You can pass any HTTP headers you wish here
      async headers() {
        return {
          // authorization: getAuthCookie(),
        };
      },
    }),
  ],
});
