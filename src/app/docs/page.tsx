import fs from 'fs';
import path from 'path';

function getSoulFile(filename: string): string {
  try {
    const soulsDir = path.join(process.cwd(), 'souls');
    return fs.readFileSync(path.join(soulsDir, filename), 'utf8');
  } catch {
    return '灵魂文件加载失败';
  }
}

export default function Docs() {
  const personas = [
    {
      key: 'carlos',
      name: 'Carlos Mendoza',
      label: '45岁 · 会计 · Boedo',
      color: '#555',
      soulFile: 'carlos-mendoza.md',
    },
    {
      key: 'maria',
      name: 'María González',
      label: '52岁 · 公立医院护士 · Floresta',
      color: '#c0392b',
      soulFile: 'maria-gonzalez.md',
    },
    {
      key: 'facundo',
      name: 'Martín "Tincho" Alderete',
      label: '29岁 · 远程工程师 · Villa Crespo',
      color: '#b7860b',
      soulFile: 'martin-alderete.md',
    },
    {
      key: 'valentina',
      name: 'Valentina Torres',
      label: '22岁 · UBA传播学学生 · Almagro',
      color: '#2980b9',
      soulFile: 'valentina-torres.md',
    },
  ];

  const soulsWithContent = personas.map(p => ({
    ...p,
    content: getSoulFile(p.soulFile),
  }));

  return (
    <main>
      <div className="container">
        <header className="docs-header">
          <h1 className="docs-title">关于 WooNews</h1>
          <p className="docs-sub">一份写给出海操盘手的阿根廷每日情报</p>
        </header>

        <section className="docs-section">
          <h2>这是什么</h2>
          <p>
            WooNews 每天追踪阿根廷西班牙语社交媒体和主流媒体的热点话题，
            用 AI 将其转化为<strong>中文情报</strong>，供计划进入或已进入阿根廷市场的出海团队参考。
          </p>
          <p>
            不是新闻翻译，不是舆情监控。WooNews 关心的是：<strong>当地人在情绪上怎么看这件事。</strong>
            真正的市场感知来自街头，不来自报告。
          </p>
        </section>

        <section className="docs-section">
          <h2>数据来源</h2>
          <p>
            每日从 <strong>Clarín</strong>、<strong>La Nación</strong> RSS 抓取当日热点，
            结合 <strong>Twitter/X</strong> 阿根廷热门话题，
            经 AI 筛选合并，提炼 5–7 个话题。
            每个话题配 4 个本地人物的真实反应模拟。
          </p>
        </section>

        <section className="docs-section">
          <h2>广场人物 · 灵魂档案</h2>
          <p>
            "广场"是 WooNews 的核心——4 个虚构的布宜诺斯艾利斯居民，
            代表当地真实的四种声音。他们的性格、记忆、偏见和说话方式
            都记录在以下灵魂档案里。档案完全公开，欢迎审视。
          </p>
          <p>
            <strong>所有金额和价格基于 2026 年 3 月布宜诺斯艾利斯真实生活成本校准。</strong>
            汇率基准：1 USD = 1,450 ARS（官方汇率）。
          </p>

          {soulsWithContent.map(p => (
            <div key={p.key} className="persona-card">
              <div className="persona-card-header">
                <span className="persona-card-name" style={{ color: p.color }}>{p.name}</span>
                <span className="persona-card-label">{p.label}</span>
              </div>
              <pre className="persona-prompt">{p.content}</pre>
            </div>
          ))}
        </section>

        <section className="docs-section">
          <h2>技术架构</h2>
          <p>
            数据采集运行在 Mac mini 本地，AI 解读与广场模拟使用 Claude（Anthropic），
            数据存储在 <strong>Supabase</strong>，前端部署在 <strong>Vercel</strong>。
            每天 07:00 自动运行完整流程。
          </p>
          <p>
            代码开源于{' '}
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
