/**
 * @fileoverview Root layout for Next.js application
 * @module app/layout
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SkyShift - Weather Cancellation & AI Rescheduling',
  description: 'Automated weather monitoring and AI-powered flight rescheduling',
};

/**
 * Root layout component
 * 
 * @param children - Child components to render
 * @returns Root layout with global styles and providers
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

