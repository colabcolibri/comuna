import type { Metadata } from 'next';
import React from 'react';
import AppNavbar from '@/components/AppNavbar';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Alumni Platform — Multi-Tenant Community Network',
  description: 'Conectando ex-alunos e comunidades com oportunidades reais.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' }}>
        <I18nProvider>
          <AppNavbar />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
