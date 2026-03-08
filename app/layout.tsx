import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { CurrencyProvider } from '@/context/CurrencyContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cryptosaurus | Hunt the Best Crypto Trades',
  description: 'Cryptosaurus is a high-performance cryptocurrency analytics and trading dashboard built for precision and speed. Hunt the best crypto trades with real-time market data.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CurrencyProvider>
          <Header />
          {children}
        </CurrencyProvider>
      </body>
    </html>
  );
}
