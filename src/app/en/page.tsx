'use client';
import { useState, useEffect } from 'react';
import { DailyPage } from '../components/DailyPage';

export default function EnHome() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <DailyPage lang="en" />;
}
