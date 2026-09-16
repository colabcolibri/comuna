'use client';

import dynamic from 'next/dynamic';

import './people-map.css';

export const PeopleMap = dynamic(() => import('./PeopleMapCanvas').then((mod) => mod.PeopleMapCanvas), {
  ssr: false,
  loading: () => <div className="people-map-frame rounded-2xl bg-muted" />,
});
