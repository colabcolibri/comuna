import * as React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@community/ui';

export interface AppAlertTemplateProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive';
  title?: React.ReactNode;
  message: React.ReactNode;
  className?: string;
}

export function AppAlertTemplate({ variant = 'default', title, message, className }: AppAlertTemplateProps) {
  const alertVariant = variant === 'destructive' ? 'destructive' : 'default';
  return (
    <Alert variant={alertVariant} className={className}>
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
