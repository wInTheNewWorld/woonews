import { Logo } from '../../components/Logo';
import fs from 'fs';
import path from 'path';

function getSoulFile(filename: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'souls', filename), 'utf8');
  } catch { return 'Soul file not available'; }
}

export default function EnDocs() {
  const personas = [
    { key: 'carlos',    name: 'Carlos Mendoza',           label: '45 · Accountant · Boedo',            color: '#555',    file: 'carlos-mendoza.md' },
    { key: 'maria',     name: 'María González',           label: '52 · Public Hospital Nurse · Floresta', color: '#c0392b', file: 'maria-gonzalez.md' },
    { key: 'tincho',    name: 'Martín "Tincho" Alderete', label: '29 · Remote Engineer · Villa Crespo', color: '#b7860b', file: 'martin-alderete.md' },
    { key: 'facundo',   name: 'Facundo Ramos',            label: '28 · Libertarian Dev · Belgrano',     color: '#e67e22', file: 'facundo-ramos.md' },
    { key: 'valentina', name: 'Valentina Torres',         label: '22 · UBA Student · Almagro',          color: '#2980b9', file: 'valentina-torres.md' },
    { key: 'hector',    name: 'Héctor Villanueva',        label: '68 · Retired Teacher · Parque Patricios', color: '#7f8c8d', file: 'hector-villanueva.md' },
    { key: 'lucia',     name: 'Lucía Kim',                label: '35 · Import Store Owner · Once',      color: '#8e44ad', file: 'lucia-kim.md' },
    { key: 'rodrigo',   name: 'Rodrigo Benítez',          label: '19 · Rappi Rider · Villa 31',         color: '#27ae60', file: 'rodrigo-benitez.md' },
  ];

  return (
    <main>
      <div className="container">
        <header className="docs-header">
          <h1 className="docs-title">About WooNews</h1>
          <p className="docs-sub">Daily Argentina intelligence for operators expanding globally</p>
        </header>

        <section className="docs-section">
          <h2>What is this</h2>
          <p>
            WooNews tracks hot topics in Argentine Spanish-language social media and press every day,
            using AI to surface <strong>decision-relevant intelligence</strong> for teams entering or
            already operating in Argentina.
          </p>
          <p>
            Not a news translation service. Not a sentiment dashboard.
            WooNews focuses on one question: <strong>how do local people emotionally read this event,
            and what does that mean for your brand or business?</strong>
          </p>
        </section>

        <section className="docs-section">
          <h2>Data Sources</h2>
          <p>
            Every day we pull from <strong>Clarín</strong> and <strong>La Nación</strong> RSS feeds,
            combined with trending <strong>Twitter/X</strong> Argentina topics.
            AI filters, deduplicates, and distills 5–7 topics per day.
            Each topic includes an interpretation and simulated reactions
            from 8 local persona archetypes.
          </p>
        </section>

        <section className="docs-section">
          <h2>The Plaza — Soul Files</h2>
          <p>
            The Plaza is WooNews's core feature: 8 fictional Buenos Aires residents representing
            the most authentic cross-section of Argentine society. Their comments are AI-generated
            based on detailed soul files that define their personality, memories, biases, and voice.
          </p>
          <p>
            <strong>All prices and amounts are calibrated to real March 2026 Buenos Aires
            cost of living.</strong> Exchange rate: 1 USD = 1,450 ARS (official).
            Soul files are fully public below.
          </p>
          <p style={{color: 'var(--ink-faint)', fontSize: '0.82rem'}}>
            Note: Soul files are written in Chinese — the primary language of WooNews's editorial team.
            They function as internal character bibles for the AI, not user-facing content.
          </p>

          {personas.map(p => (
            <div key={p.key} className="persona-card">
              <div className="persona-card-header">
                <span className="persona-card-name" style={{ color: p.color }}>{p.name}</span>
                <span className="persona-card-label">{p.label}</span>
              </div>
              <pre className="persona-prompt">{getSoulFile(p.file)}</pre>
            </div>
          ))}
        </section>

        <section className="docs-section">
          <h2>How it works</h2>
          <p>
            Data collection runs on a local Mac mini, AI interpretation uses Claude (Anthropic),
            data is stored in <strong>Supabase</strong>, frontend is deployed on <strong>Vercel</strong>.
            The full pipeline runs automatically every day at 07:00 CST.
          </p>
          <p>
            Source code:{' '}
            <a href="https://github.com/wInTheNewWorld/woonews" target="_blank" rel="noopener noreferrer" style={{color:'var(--ink-sub)'}}>
              GitHub →
            </a>
          </p>
        </section>

        <footer className="site-footer">WooNews · Built by WooWoo</footer>
      </div>
    </main>
  );
}
