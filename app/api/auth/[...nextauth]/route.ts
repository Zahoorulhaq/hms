// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AUTH } from '@/server/endpoints';
import {ACTIVE_URLS} from '@/utils/constants'
const apiPath = ACTIVE_URLS.ACTIVE_API_URL

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'text'     },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const request = await fetch(`${apiPath}/${AUTH.LOGIN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
         console.log('====================================11111');
          console.log(request, `${apiPath}/${AUTH.LOGIN}`);
          console.log('====================================');
        const result = await request.json();
         
          if(!request.ok || !result?.data?.user) {
            throw new Error(result?.message || 'Invalid credentials');
          }
          const { token, user } = result?.data;

          return {
            id:       String(user.id),
            name:     user.name,
            email:    user.email,
            role:     user.role,
            ref:      user.ref,
            token:    token,          // Sanctum token — critical
            client:   user.client,   // hotel info
          };

        } catch (error: any) {
          // Throw so NextAuth passes the message to the error param
          throw new Error(error.message || 'Invalid credentials');
        }
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error:  '/login',   // redirect errors back to login with ?error=
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60,  // 30 days — matches Laravel token expiry
  },

  callbacks: {
    // 1. Called after authorize() returns — persist extra fields into JWT
    async jwt({ token, user }) {
      if (user) {
        // First login — user object comes from authorize()
        token.id      = user.id;
        token.role    = (user as any).role;
        token.ref     = (user as any).ref;
        token.token   = (user as any).token;   // Sanctum token stored in JWT
        token.client  = (user as any).client;
      }
      return token;
    },

    // 2. Called whenever session is checked — expose JWT fields to client
    async session({ session, token }) {
      if (token) {
        session.user.id     = token.id as string;
        session.user.role   = token.role as string;
        session.user.ref    = token.ref as string;
        session.user.token  = token.token as string;  // available on client
        session.user.client = token.client as any;
      }
      return session;
    },
  },

  events: {
    // Called on signOut — revoke Sanctum token from Laravel
    async signOut({ token }: { token: any }) {
      if (token?.token) {
        // await logoutRequest(token.token).catch(() => {});
      }
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };