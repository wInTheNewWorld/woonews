import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WooNews — Argentina Market Intelligence',
  description: 'Daily Argentina sentiment for global operators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
