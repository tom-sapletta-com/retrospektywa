import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link prefetch={false} className="wordmark" href="/" aria-label="Retrospektywa — strona główna">
        <span aria-hidden="true" className="signal-mark" />
        RETROSPEKTYWA.PL
      </Link>
      <nav aria-label="Główna nawigacja">
        <Link prefetch={false} href="/ksiazka">Książka</Link>
        <Link prefetch={false} href="/dsl">DSL</Link>
        <Link prefetch={false} href="/#eseje">Blog</Link>
        <Link prefetch={false} href="/podcast">Podcast</Link>
        <Link prefetch={false} href="/laboratorium">Eksperymenty</Link>
      </nav>
    </header>
  );
}
