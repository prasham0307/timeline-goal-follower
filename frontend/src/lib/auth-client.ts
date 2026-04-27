import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields } from 'better-auth/client/plugins';

export const { signUp, signIn, signOut, useSession, useAtom } = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  plugins: [
    inferAdditionalFields({}),
  ],
});

export type Session = typeof useSession.$Inferred;
