export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="site-nav">
        <a href="/en" className="nav-brand">WooNews</a>
        <ul className="nav-links">
          <li><a href="/en">Argentina Intel</a></li>
          <li><a href="/en/docs">Docs</a></li>
        </ul>
      </nav>
      {children}
    </>
  );
}
