'use client';
import { useState, useEffect } from 'react';
import { DailyPage } from './components/DailyPage';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <>
      <nav className="site-nav">
        <a href="/" className="nav-brand">WooNews</a>
        <ul className="nav-links">
          <li><a href="/">阿根廷情报</a></li>
          <li><a href="/docs">文档</a></li>
        </ul>
      </nav>
      <DailyPage lang="zh" />
    </>
  );
}
