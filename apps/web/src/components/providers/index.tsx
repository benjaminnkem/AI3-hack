'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { TooltipProvider } from '../ui/tooltip';
import { SmoothScrollProvider } from './SmoothScrollProvider';
import { CustomCursor } from './CustomCursor';

export const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SmoothScrollProvider>
          {children}
          <CustomCursor />
        </SmoothScrollProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
