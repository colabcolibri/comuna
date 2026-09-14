import * as React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export interface AppAlertTemplateProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive';
  title?: React.ReactNode;
  message: React.ReactNode;
  className?: string;
}

export function AppAlertTemplate({ variant = 'default', title, message, className }: AppAlertTemplateProps) {
  return (
    <Alert variant={variant} className={className}>
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
