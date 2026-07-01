import Providers from '@/providers/providers'
import '@/styles/global.scss'
import { Poppins } from 'next/font/google'


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
