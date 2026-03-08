'use client';
import { useState, useEffect } from 'react';
import { DailyPage } from '../components/DailyPage';
import { Logo } from '../components/Logo';

export default function EnHome() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <>
      <nav className="site-nav">
        <a href="/en" className="nav-brand"><Logo /></a>
        <ul className="nav-links">
          <li><a href="/en">Argentina Intel</a></li>
          <li><a href="/en/docs">Docs</a></li>
          <li><a href="/" className="lang-switch">中文</a></li>
        </ul>
      </nav>
      <DailyPage lang="en" />
    </>
  );
}
