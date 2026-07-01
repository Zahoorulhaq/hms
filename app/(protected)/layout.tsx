import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import AuthCheck from '@/providers/authcheck';

// Components
// Styles
import '@/styles/global.scss';
import Script from 'next/script';
import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'HMS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthCheck>
      <AppShell>
      {/* <GlobalData /> */}
      {children}
      </AppShell>
      <footer className="footer-class"></footer>
    </AuthCheck>
  );
}
