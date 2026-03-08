import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WooNews — Argentina Market Intelligence',
  description: 'Daily Argentina sentiment tracking for global operators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <nav className="site-nav">
          <a href="/" className="nav-brand">WooNews</a>
          <ul className="nav-links">
            <li><a href="/">阿根廷情报</a></li>
            <li><a href="/docs">文档</a></li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  );
}
