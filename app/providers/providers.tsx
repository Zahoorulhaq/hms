// src/providers.tsx
'use client'

import 'react-toastify/dist/ReactToastify.css'

import React, { ReactNode, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider as NextAuthProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import store from '@/store/store' // Adjust the path accordingly
import { ToastContainer } from 'react-toastify'

interface ProvidersProps {
  children: ReactNode
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
      <NextAuthProvider refetchInterval={0} refetchOnWindowFocus={false}>
          <QueryClientProvider client={queryClient}>
          <ReduxProvider store={store}>
            {children}
          </ReduxProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <ToastContainer />
        </QueryClientProvider>
      </NextAuthProvider>
  )
}

export default Providers
