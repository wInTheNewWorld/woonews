import type { Metadata } from 'next';
import { Oswald } from 'next/font/google';

const oswald = Oswald({ subsets: ['latin'], weight: ['600', '700'] });
import './globals.css';

export const metadata: Metadata = {
  title: 'WooNews — Argentina Market Intelligence',
  description: 'Daily Argentina sentiment for global operators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" className={oswald.className}>
      <body>{children}</body>
    </html>
  );
}
