import React from 'react';

export const metadata = {
  title: 'Alumni Platform',
  description: 'Plataforma de Rede e Comunidades Multi-Tenant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#ffffff' }}>
        {children}
      </body>
    </html>
  );
}
