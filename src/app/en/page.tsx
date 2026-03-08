'use client';
import { useState, useEffect } from 'react';
import { DailyPage } from '../components/DailyPage';

export default function EnHome() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <>
      <nav className="site-nav">
        <a href="/en" className="nav-brand">WooNews</a>
        <ul className="nav-links">
          <li><a href="/en">Argentina Intel</a></li>
          <li><a href="/en/docs">Docs</a></li>
        </ul>
      </nav>
      <DailyPage lang="en" />
    </>
  );
}
