'use client';

import dynamic from 'next/dynamic';

export const PeopleMap = dynamic(() => import('./PeopleMapCanvas').then((mod) => mod.PeopleMapCanvas), {
  ssr: false,
  loading: () => <div className="h-[min(70vh,32rem)] w-full min-w-0 rounded-2xl bg-muted" />,
});
