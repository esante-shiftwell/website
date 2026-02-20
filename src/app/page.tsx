import Link from 'next/link';

export default function RootPage() {
  return (
    <main>
      <div className="topbar">
        <div className="brand">
          <span className="brand-mark" />
          <div>
            <div className="brand-name">Shiftwell</div>
            <div className="small muted">Circadian research · static app</div>
          </div>
        </div>
      </div>

      <section className="card" style={{ padding: 20 }}>
        <h1 className="section-title">Choose your language</h1>
        <p className="section-subtitle">
          Select a language to access the Shiftwell home page.
        </p>

        <div className="row" style={{ marginTop: 14 }}>
          <Link className="btn primary" href="/fr/">
            Français
          </Link>
          <Link className="btn" href="/en/">
            English
          </Link>
          <Link className="btn" href="/de/">
            Deutsch
          </Link>
        </div>
      </section>
    </main>
  );
}