import Link from 'next/link';
import Image from 'next/image';

const languages = [
  {
    code: 'fr',
    label: 'Français',
    title: 'Version française',
    text: 'Accéder à Shiftwell en français (analyse hebdomadaire, scoring local, contribution étude).',
    cta: 'Ouvrir',
    primary: true,
  },
  {
    code: 'en',
    label: 'English',
    title: 'English version',
    text: 'Open Shiftwell in English for weekly work/sleep analysis and study contribution.',
    cta: 'Open',
    primary: false,
  },
  {
    code: 'de',
    label: 'Deutsch',
    title: 'Deutsche Version',
    text: 'Shiftwell auf Deutsch öffnen (Wochenanalyse, lokale Berechnung, Studienbeitrag).',
    cta: 'Öffnen',
    primary: false,
  },
] as const;

export default function RootPage() {
  return (
    <main>
      <div className="topbar">
        <div className="brand">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: '#0f172a',
            }}
          >
            <Image
              src="/shiftwell-icon.png"
              alt="Shiftwell"
              width={40}
              height={40}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              unoptimized
            />
          </div>
          <div>
            <div className="brand-name">Shiftwell</div>
            <div className="small muted">Circadian research · static app</div>
          </div>
        </div>

        <div className="row">
          <span className="badge primary">MVP</span>
          <span className="badge secondary">Cloudflare Pages</span>
        </div>
      </div>

      <section
        className="card"
        style={{
          padding: 20,
          marginBottom: 16,
          background:
            'radial-gradient(circle at 15% 20%, rgba(42,157,143,0.10), transparent 45%), radial-gradient(circle at 85% 10%, rgba(244,162,97,0.12), transparent 40%), #ffffff',
        }}
      >
        <div className="grid grid-2" style={{ alignItems: 'center' }}>
          <div>
            <span className="badge primary">Shiftwell · Circadian Research</span>
            <h1 className="section-title" style={{ marginTop: 12, fontSize: 28 }}>
              Analyse travail / sommeil pour horaires atypiques
            </h1>
            <p className="section-subtitle" style={{ marginTop: 8 }}>
              Outil de pré-analyse en chronobiologie pour professionnels en horaires atypiques.
              Le score est calculé localement dans le navigateur, puis la contribution à l’étude
              est proposée séparément (opt-in).
            </p>

            <div className="row" style={{ marginTop: 16 }}>
              <Link className="btn primary" href="/fr/">
                Commencer (FR)
              </Link>
              <Link className="btn" href="/en/">
                Start (EN)
              </Link>
              <Link className="btn" href="/de/">
                Start (DE)
              </Link>
            </div>

            <div className="notice" style={{ marginTop: 14 }}>
              <div className="small">
                <strong>Important.</strong> Outil de recherche / pré-analyse. Ne remplace pas un
                avis médical.
              </div>
            </div>
          </div>

          <div>
            <div className="card soft" style={{ padding: 14 }}>
              <div className="small muted" style={{ marginBottom: 8 }}>
                Aperçu de l’expérience
              </div>

              <div className="grid" style={{ gap: 10 }}>
                <FeatureLine
                  title="1. Agenda hebdomadaire"
                  text="Saisie des plages de travail et de sommeil sur 7 jours (segments multiples / passage minuit)."
                />
                <FeatureLine
                  title="2. Calcul local"
                  text="3 scores calculés dans le navigateur : risque, sommeil, adaptabilité."
                />
                <FeatureLine
                  title="3. Contribution étude"
                  text="Envoi optionnel après consentement explicite (collecte séparée du score)."
                />
                <FeatureLine
                  title="4. Pages explicatives"
                  text="Méthode, étude, notice d’information et contexte projet."
                />
              </div>

              <div className="divider" />

              <div className="small muted" style={{ marginBottom: 8 }}>
                Preview calendrier (mock)
              </div>
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  background: 'white',
                  padding: 10,
                }}
              >
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                  <div
                    key={d}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '52px 1fr',
                      gap: 8,
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <div className="small muted">{d}</div>
                    <div
                      style={{
                        height: 10,
                        borderRadius: 999,
                        background:
                          d === 'Sat' || d === 'Sun'
                            ? 'linear-gradient(90deg, rgba(42,157,143,.25), rgba(42,157,143,.05))'
                            : 'linear-gradient(90deg, rgba(30,42,68,.20), rgba(244,162,97,.15))',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h2 className="section-title">Choose your language</h2>
        <p className="section-subtitle">
          Select a language to access Shiftwell pages and the weekly analysis tool.
        </p>

        <div className="grid grid-3" style={{ marginTop: 16 }}>
          {languages.map((lang) => (
            <div key={lang.code} className="card soft" style={{ padding: 14 }}>
              <div className={`badge ${lang.primary ? 'primary' : 'secondary'}`}>{lang.label}</div>
              <h3 style={{ margin: '10px 0 6px' }}>{lang.title}</h3>
              <p className="small muted" style={{ margin: 0, minHeight: 54 }}>
                {lang.text}
              </p>

              <div className="row" style={{ marginTop: 12 }}>
                <Link className={`btn ${lang.primary ? 'primary' : ''}`} href={`/${lang.code}/`}>
                  {lang.cta}
                </Link>
                <Link className="btn ghost" href={`/${lang.code}/analyze/`}>
                  Analyze
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-3" style={{ marginBottom: 16 }}>
        <section className="card" style={{ padding: 16 }}>
          <div className="badge secondary">Method</div>
          <h3 style={{ margin: '10px 0 6px' }}>Scoring & assumptions</h3>
          <p className="small muted" style={{ margin: 0 }}>
            Page dédiée pour expliquer les scores, les proxies, la version de scoring et le lien au
            papier de recherche.
          </p>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <div className="badge warn">Study</div>
          <h3 style={{ margin: '10px 0 6px' }}>Participation details</h3>
          <p className="small muted" style={{ margin: 0 }}>
            Finalité de l’étude, population cible, données collectées, durée estimée et contribution
            opt-in.
          </p>
        </section>

        <section className="card" style={{ padding: 16 }}>
          <div className="badge primary">Consent</div>
          <h3 style={{ margin: '10px 0 6px' }}>Notice versionnée</h3>
          <p className="small muted" style={{ margin: 0 }}>
            Notice d’information séparée, multilingue et versionnée (ex: notice-v0.1) pour garder
            une trace propre.
          </p>
        </section>
      </div>

      <section className="card soft" style={{ padding: 14 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="small muted">Shiftwell · Circadian Research · Static export ready</div>
          <div className="small muted">FR / EN / DE</div>
        </div>
      </section>
    </main>
  );
}

function FeatureLine({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 10,
        background: 'white',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13 }}>{title}</div>
      <div className="small muted" style={{ marginTop: 4 }}>
        {text}
      </div>
    </div>
  );
}