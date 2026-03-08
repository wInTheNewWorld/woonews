import fs from 'fs';
import path from 'path';
import { PersonaCard } from '../components/PersonaCard';
import { PersonaAutoOpen } from '../components/PersonaAutoOpen';
import { Logo } from '../components/Logo';

function getSoulFile(filename: string): string {
  try {
    return fs.readFileSync(path.join(process.cwd(), 'souls', filename), 'utf8');
  } catch { return '灵魂文件加载失败'; }
}

function Nav() {
  return (
    <nav className="site-nav">
      <a href="/" className="nav-brand"><Logo /></a>
      <ul className="nav-links">
        <li><a href="/">阿根廷情报</a></li>
        <li><a href="/docs">文档</a></li>
      </ul>
    </nav>
  );
}

export default function Docs() {
  const personas = [
    { key: 'carlos',    name: 'Carlos Mendoza',           label: '45岁 · 会计 · Boedo',             color: '#555',    file: 'carlos-mendoza.md' },
    { key: 'maria',     name: 'María González',           label: '52岁 · 公立医院护士 · Floresta',   color: '#c0392b', file: 'maria-gonzalez.md' },
    { key: 'tincho',    name: 'Martín "Tincho" Alderete', label: '29岁 · 远程工程师 · Villa Crespo', color: '#b7860b', file: 'martin-alderete.md' },
    { key: 'facundo',   name: 'Facundo Ramos',            label: '28岁 · 自由派开发 · Belgrano',     color: '#e67e22', file: 'facundo-ramos.md' },
    { key: 'valentina', name: 'Valentina Torres',         label: '22岁 · UBA学生 · Almagro',         color: '#2980b9', file: 'valentina-torres.md' },
    { key: 'hector',    name: 'Héctor Villanueva',        label: '68岁 · 退休教师 · Parque Patricios',color: '#7f8c8d', file: 'hector-villanueva.md' },
    { key: 'lucia',     name: 'Lucía Kim',                label: '35岁 · 进口店主 · Once',           color: '#8e44ad', file: 'lucia-kim.md' },
    { key: 'rodrigo',   name: 'Rodrigo Benítez',          label: '19岁 · Rappi骑手 · Villa 31',      color: '#27ae60', file: 'rodrigo-benitez.md' },
  ];

  return (
    <>
      <Nav />
      <main>
        <div className="container">
          <header className="docs-header">
            <h1 className="docs-title">关于 WooNews</h1>
            <p className="docs-sub">为出海团队准备的阿根廷每日情报</p>
          </header>

          <section className="docs-section">
            <h2>这是什么</h2>
            <p>WooNews 每天追踪阿根廷西班牙语社交媒体和媒体的热点话题，用 AI 提炼对出海团队有决策价值的情报。</p>
            <p>不是新闻翻译，不是情绪仪表盘。WooNews 只关注一个问题：<strong>本地人怎么读这件事，对你的品牌或业务意味着什么？</strong></p>
          </section>

          <section className="docs-section">
            <h2>数据来源</h2>
            <p>每天从 <strong>Clarín</strong>、<strong>La Nación</strong> RSS + 阿根廷 <strong>Twitter/X</strong> 热榜采集，AI 过滤去重后每日提炼 5–7 个话题，附带解读和 8 位本地人物画像的模拟反应。</p>
          </section>

          <section className="docs-section">
            <h2>广场人物画像</h2>
            <p>广场是 WooNews 的核心功能：8 位虚构的布宜诺斯艾利斯居民，覆盖阿根廷社会最真实的横切面。评论由 AI 根据详细的灵魂文件生成，定义了每个人的性格、记忆、偏见和说话方式。</p>
            <p><strong>所有价格和收入数据均基于 2026年3月 布宜诺斯艾利斯真实生活成本校准。</strong>汇率：1 USD = 1,450 ARS（官方）。</p>
            <p style={{color:'var(--ink-faint)',fontSize:'0.82rem'}}>点击人物卡片可展开完整灵魂文件。</p>

            <PersonaAutoOpen />
            {personas.map(p => (
              <PersonaCard
                key={p.key}
                personaKey={p.key}
                name={p.name}
                label={p.label}
                color={p.color}
                soul={getSoulFile(p.file)}
              />
            ))}
          </section>

          <section className="docs-section">
            <h2>技术架构</h2>
            <p>数据采集运行在本地 Mac mini，AI 解读使用 Claude（Anthropic），数据存储于 <strong>Supabase</strong>，前端部署在 <strong>Vercel</strong>。完整流水线每天 07:00 CST 自动运行。</p>
            <p>源代码：<a href="https://github.com/wInTheNewWorld/woonews" target="_blank" rel="noopener noreferrer" style={{color:'var(--ink-sub)'}}>GitHub →</a></p>
          </section>

          <footer className="site-footer">WooNews · Built by WooWoo</footer>
        </div>
      </main>
    </>
  );
}
