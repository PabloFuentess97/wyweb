import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role: 'staff_admin' | 'staff_agent' | 'client_admin' | 'client_user';
      themePreference: 'light' | 'dark' | 'system';
      densityPreference: 'comfortable' | 'compact';
      language: string;
      customerIds: string[];
    };
  }

  interface User {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role: 'staff_admin' | 'staff_agent' | 'client_admin' | 'client_user';
    themePreference: 'light' | 'dark' | 'system';
    densityPreference: 'comfortable' | 'compact';
    language: string;
    customerIds: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'staff_admin' | 'staff_agent' | 'client_admin' | 'client_user';
    themePreference: 'light' | 'dark' | 'system';
    densityPreference: 'comfortable' | 'compact';
    language: string;
    customerIds: string[];
  }
}

export {};
