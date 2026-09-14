import type { Metadata } from 'next';
import React from 'react';
import { Atkinson_Hyperlegible, Inter } from 'next/font/google';
import MemberHeader from '@/components/app/MemberHeader';
import MemberFooter from '@/components/app/MemberFooter';
import './globals.css';

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-atkinson',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Community',
  description: 'Diretório profissional de comunidades',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${atkinson.variable} ${inter.variable} h-full`}>
      <body className={`${atkinson.className} min-h-full flex flex-col antialiased`}>
        <MemberHeader />
        {children}
        <MemberFooter />
      </body>
    </html>
  );
}
