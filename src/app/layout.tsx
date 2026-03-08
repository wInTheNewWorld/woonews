import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WooNews — 阿根廷市场情报',
  description: '每日追踪阿根廷舆情，为出海操盘手提供决策参考',
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
