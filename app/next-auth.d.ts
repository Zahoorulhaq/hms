// types/next-auth.d.ts
import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      name: string;
      email: string;
      agentId?: string; // Add your custom property here
      // Add other custom properties as needed
    } & DefaultSession['user']; // Include the default user properties
  }

  interface User {
    name: string;
    email: string;
    agentId?: string; // Add your custom property here
    // Add other custom properties as needed
  }
}
