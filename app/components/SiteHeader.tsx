import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link className="wordmark" href="/" aria-label="Retrospektywa — strona główna">
        <span aria-hidden="true" className="signal-mark" />
        RETROSPEKTYWA.PL
      </Link>
      <nav aria-label="Główna nawigacja">
        <Link href="/ksiazka">Książka</Link>
        <Link href="/dsl">DSL</Link>
        <Link href="/#eseje">Blog</Link>
        <Link href="/podcast">Podcast</Link>
        <Link href="/laboratorium">Eksperymenty</Link>
      </nav>
    </header>
  );
}
