import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import prisma from '../db';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'sqlite',
  }),
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',
  trustedOrigins: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  emailAndPassword: {
    enabled: true,
    autoSignUpCallback: async (user: any) => {
      // Auto-create user on email/password signup
      return user;
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  callbacks: {
    async onSignUp(user: any) {
      console.log('New user signed up:', user.email);
      return user;
    },
    async onSignIn(user: any) {
      console.log('User signed in:', user.email);
      return user;
    },
    async onError(error: any) {
      console.error('Auth error:', error);
    },
  },
});
