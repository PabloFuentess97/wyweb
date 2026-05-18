import 'server-only';
import NextAuth from 'next-auth';
import { authConfig } from './config';

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
