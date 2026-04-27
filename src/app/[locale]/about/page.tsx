import { notFound } from 'next/navigation';
import { isLocale, LOCALES, type Locale } from '@/i18n';
import LocaleNav from '@/components/LocaleNav';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const content = {
  fr: {
    label: 'About',
    title: 'A propos de Shiftwell',
    line: 'Rendre visible ce que les semaines de nuit effacent a bas bruit.',
    subtitle:
      'Shiftwell cherche a rendre lisible ce que les semaines de nuit, les horaires coupes et les rythmes instables usent lentement. Le projet reste sobre sur ses promesses, mais il veut etre fort sur sa lisibilite.',
    manifestoLabel: 'Manifesto',
    manifesto:
      'Ce n est ni une montre connectee ni un diagnostic. C est une interface de recherche qui transforme un planning en lecture de charge, de recuperation et de fragilite circadienne.',
    whyTitle: 'Pourquoi le produit existe',
    whyText:
      'Les personnes a horaires atypiques vivent des semaines qui paraissent ordinaires sur le papier mais qui ecrasent peu a peu le sommeil, la recuperation et la vie sociale. Shiftwell essaie de rendre cette erosion visible, lisible et discutable.',
    assumeTitle: 'Ce que le projet assume',
    assumeText:
      'Le moteur actuel est un MVP proxy. Il est documente, trace et perfectible. Il prefere dire clairement ce qu il approxime plutot que simuler une precision clinique qu il n a pas encore.',
    provenanceTitle: 'Provenance des references',
    provenanceText:
      'Shiftwell s appuie sur des references scientifiques tierces et sur des copies locales de travail pour comparer, mapper et expliquer son moteur. Ces contenus restent externes au projet : aucune paternite ni appropriation n est revendiquee.',
    directionLabel: 'Direction du projet',
    directionTitle: 'Un projet research-first, pas une promesse magique.',
    directionText:
      'Shiftwell avance en essayant de garder ensemble trois exigences qui s opposent souvent : une interface simple, une formule suffisamment honnete, et une documentation assez claire pour que d autres puissent auditer ou contribuer sans devoir deviner la logique du projet.',
    ossLabel: 'Open source',
    ossText:
      'Le repo doit pouvoir accueillir des profils differents, pas seulement des devs tres experimentes. C est pour ca que la surface publique, la provenance des references et la lisibilite du moteur comptent autant que le score lui-meme.',
    cards: [
      {
        label: 'Layer',
        title: 'Positionnement',
        text: 'Shiftwell n est pas un outil de diagnostic. Il structure une collecte travail/sommeil et produit des scores indicatifs dans un cadre de recherche, avec une attention forte a l explicabilite.',
      },
      {
        label: 'Layer',
        title: 'Pourquoi ce format',
        text: 'Le calcul local reduit la friction, facilite un usage open source et limite la dependance a un backend. La contribution a l etude vient ensuite, avec consentement explicite.',
      },
      {
        label: 'Layer',
        title: 'Direction produit',
        text: 'Le cap reste le meme : un moteur plus solide, une meilleure trace des facteurs, puis une interface capable de faire comprendre la semaine au lieu de juste afficher des chiffres.',
      },
      {
        label: 'Layer',
        title: 'Stack',
        text: 'Next.js en export statique, Cloudflare Pages, GitHub Actions et Wrangler. La pile est volontairement legere pour garder le projet diffusable et contributif.',
      },
    ],
  },
  en: {
    label: 'About',
    title: 'About Shiftwell',
    line: 'Making visible what irregular weeks quietly wear away.',
    subtitle:
      'Shiftwell tries to make visible what night weeks, split schedules, and unstable rhythms slowly wear down. The project stays modest in its claims, but wants to be strong in legibility.',
    manifestoLabel: 'Manifesto',
    manifesto:
      'It is neither a wearable nor a diagnosis. It is a research interface that turns a schedule into a readable picture of load, recovery, and circadian strain.',
    whyTitle: 'Why the product exists',
    whyText:
      'People with atypical schedules often live through weeks that look ordinary on paper while quietly eroding sleep, recovery, and social time. Shiftwell tries to make that erosion visible, readable, and discussable.',
    assumeTitle: 'What the project assumes',
    assumeText:
      'The current engine is a proxy MVP. It is documented, traceable, and imperfect by design. It prefers to state what it approximates rather than pretend to have clinical precision it does not yet have.',
    provenanceTitle: 'Reference provenance',
    provenanceText:
      'Shiftwell relies on third-party scientific references and local working copies to compare, map, and explain its engine. Those materials remain external to the project: no authorship or ownership is claimed.',
    directionLabel: 'Project direction',
    directionTitle: 'A research-first project, not a magical promise.',
    directionText:
      'Shiftwell is moving by trying to hold together three tensions that often pull apart: a simple interface, a formula honest enough to be trusted, and documentation clear enough that others can audit or contribute without guessing the project logic.',
    ossLabel: 'Open source',
    ossText:
      'The repository should welcome different kinds of contributors, not only highly experienced developers. That is why the public surface, source provenance, and engine legibility matter almost as much as the score itself.',
    cards: [
      {
        label: 'Layer',
        title: 'Positioning',
        text: 'Shiftwell is not a diagnostic tool. It structures work/sleep collection and produces indicative scores in a research setting, with a strong emphasis on explainability.',
      },
      {
        label: 'Layer',
        title: 'Why this format',
        text: 'Local computation reduces friction, supports open-source use, and limits backend dependency. Study contribution comes later with explicit consent.',
      },
      {
        label: 'Layer',
        title: 'Product direction',
        text: 'The direction stays the same: a stronger engine, a richer factor trace, then an interface that helps people understand a week instead of just showing numbers.',
      },
      {
        label: 'Layer',
        title: 'Stack',
        text: 'Next.js static export, Cloudflare Pages, GitHub Actions, and Wrangler. The stack stays intentionally light so the project remains easy to distribute and contribute to.',
      },
    ],
  },
  de: {
    label: 'About',
    title: 'Uber Shiftwell',
    line: 'Sichtbar machen, was unregelmassige Wochen leise abbauen.',
    subtitle:
      'Shiftwell versucht sichtbar zu machen, was Nachtwochen, geteilte Plane und instabile Rhythmen langsam abbauen. Das Projekt bleibt bescheiden in seinen Versprechen, will aber stark in seiner Lesbarkeit sein.',
    manifestoLabel: 'Manifesto',
    manifesto:
      'Es ist weder ein Wearable noch eine Diagnose. Es ist eine Forschungsoberflache, die einen Plan in eine lesbare Darstellung von Belastung, Erholung und zirkadianer Spannung verwandelt.',
    whyTitle: 'Warum das Produkt existiert',
    whyText:
      'Menschen mit atypischen Arbeitszeiten leben oft Wochen, die auf dem Papier normal wirken und dennoch Schlaf, Erholung und soziale Zeit leise abbauen. Shiftwell versucht, diese Erosion sichtbar, lesbar und diskutierbar zu machen.',
    assumeTitle: 'Was das Projekt annimmt',
    assumeText:
      'Die aktuelle Engine ist ein Proxy-MVP. Sie ist dokumentiert, nachvollziehbar und bewusst unvollkommen. Sie sagt lieber klar, was sie approximiert, statt klinische Prazision vorzutauschen, die noch nicht vorhanden ist.',
    provenanceTitle: 'Referenz-Provenienz',
    provenanceText:
      'Shiftwell stutzt sich auf wissenschaftliche Drittquellen und lokale Arbeitskopien, um seine Engine zu vergleichen, zu mappen und zu erklaren. Diese Materialien bleiben extern zum Projekt: weder Autorschaft noch Eigentum werden beansprucht.',
    directionLabel: 'Projektrichtung',
    directionTitle: 'Ein research-first Projekt, keine magische Verheissung.',
    directionText:
      'Shiftwell versucht drei Spannungen zugleich zu halten, die oft auseinanderfallen: eine einfache Oberflache, eine ausreichend ehrliche Formel und eine Dokumentation, die klar genug ist, damit andere den Projektkern verstehen, auditieren oder mitgestalten konnen.',
    ossLabel: 'Open source',
    ossText:
      'Das Repository soll unterschiedliche Profile willkommen heissen, nicht nur sehr erfahrene Entwickler. Deshalb zahlen die offentliche Oberflache, die Provenienz der Referenzen und die Lesbarkeit der Engine fast genauso viel wie der Score selbst.',
    cards: [
      {
        label: 'Layer',
        title: 'Positionierung',
        text: 'Shiftwell ist kein Diagnosetool. Es strukturiert Arbeits-/Schlafdaten und erzeugt indikative Scores im Forschungskontext, mit starkem Fokus auf Explainability.',
      },
      {
        label: 'Layer',
        title: 'Warum dieses Format',
        text: 'Lokale Berechnung reduziert Reibung, unterstutzt Open-Source-Nutzung und vermeidet Backend-Zwang. Der Studienbeitrag folgt spater mit ausdrucklicher Einwilligung.',
      },
      {
        label: 'Layer',
        title: 'Produktrichtung',
        text: 'Die Richtung bleibt gleich: eine starkere Engine, eine reichere Faktor-Trace und danach eine Oberflache, die eine Woche verstandlich macht statt nur Zahlen zu zeigen.',
      },
      {
        label: 'Layer',
        title: 'Stack',
        text: 'Next.js Static Export, Cloudflare Pages, GitHub Actions und Wrangler. Die Stack bleibt bewusst leicht, damit das Projekt einfach verbreitet und mitgestaltet werden kann.',
      },
    ],
  },
} as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = content[locale];

  return (
    <main>
      <LocaleNav locale={locale} />

      <div className="sw-public-wide">
        <div className="sw-public-inner">
          <div className="sw-about-shell">
            <section className="sw-about-hero">
              <div className="sw-about-hero-main">
                <span className="badge primary sw-flow-kicker">{c.label}</span>
                <h1 className="sw-about-title">{c.title}</h1>
                <p className="sw-about-line">{c.line}</p>
                <p className="sw-about-lead">{c.subtitle}</p>
              </div>

              <aside className="sw-about-manifesto">
                <div className="sw-flow-caption">{c.manifestoLabel}</div>
                <p className="sw-flow-copy" style={{ marginTop: 0 }}>
                  {c.manifesto}
                </p>
              </aside>
            </section>

            <section className="sw-about-row sw-about-row-3 sw-about-row-intro">
              <article className="sw-about-note">
                <div className="sw-flow-caption">Shiftwell</div>
                <h2 className="sw-flow-heading">{c.whyTitle}</h2>
                <p className="sw-flow-copy">{c.whyText}</p>
              </article>

              <article className="sw-about-note">
                <div className="sw-flow-caption">Shiftwell</div>
                <h2 className="sw-flow-heading">{c.assumeTitle}</h2>
                <p className="sw-flow-copy">{c.assumeText}</p>
              </article>

              <article className="sw-about-note">
                <div className="sw-flow-caption">Shiftwell</div>
                <h2 className="sw-flow-heading">{c.provenanceTitle}</h2>
                <p className="sw-flow-copy">{c.provenanceText}</p>
              </article>
            </section>

            <section className="sw-about-row sw-about-row-feature sw-about-row-wide">
              <div className="sw-about-feature-copy">
                <div className="sw-flow-caption">{c.directionLabel}</div>
                <h2 className="sw-about-feature-title">{c.directionTitle}</h2>
                <p className="sw-about-lead" style={{ marginTop: 0, maxWidth: '60ch' }}>
                  {c.directionText}
                </p>
              </div>

              <aside className="sw-about-oss">
                <div className="sw-flow-caption">{c.ossLabel}</div>
                <p className="sw-flow-copy" style={{ marginTop: 0 }}>
                  {c.ossText}
                </p>
              </aside>
            </section>

            <section className="sw-about-row sw-about-row-cards sw-about-row-end">
              {c.cards.map((item) => (
                <article key={item.title} className="sw-about-card">
                  <div className="sw-flow-caption">{item.label}</div>
                  <h2 className="sw-flow-heading">{item.title}</h2>
                  <p className="sw-flow-copy">{item.text}</p>
                </article>
              ))}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
