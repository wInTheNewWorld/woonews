import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WooNews — Argentina Market Intelligence',
  description: 'Daily Argentina sentiment tracking for global operators',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var path = window.location.pathname;
            var lang = navigator.language || navigator.userLanguage || '';
            var isChinese = lang.toLowerCase().startsWith('zh');
            if (!isChinese && path === '/') {
              window.location.replace('/en');
            } else if (isChinese && path === '/en') {
              window.location.replace('/');
            }
          })();
        `}} />
      </head>
      <body>
        <nav className="site-nav">
          <a href="/" className="nav-brand">WooNews</a>
          <ul className="nav-links">
            <li><a href="/">阿根廷情报</a></li>
            <li><a href="/en">English</a></li>
            <li><a href="/docs">文档</a></li>
          </ul>
        </nav>
        {children}
      </body>
    </html>
  );
}
