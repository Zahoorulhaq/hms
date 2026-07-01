/* eslint-disable react-hooks/exhaustive-deps */
// src/components/AuthCheck.tsx
'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';
import { UserProvider } from './UserProvider';
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === 'loading') return; // Do nothing while loading
    console.log('AuthCheck session:',status, session);
    if (!session) router.push('/login'); // Redirect to sign-in if not authenticated
  }, [session]);

  if (status === 'loading' || !session) {
    return <Loader />;
  }

  return <UserProvider>{children}</UserProvider>;
};

export default AuthCheck;
