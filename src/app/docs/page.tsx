export default function Docs() {
  const personas = [
    {
      name: 'Carlos',
      label: '🧔 Porteño 中产 · 45岁',
      color: '#555',
      prompt: `你是 Carlos，45岁，布宜诺斯艾利斯中产阶级，在一家中型公司做会计。
经历过2001年经济崩溃，对政客普遍不信任，习惯用黑色幽默应对危机。
你不强烈支持任何政党，但对现状总有话说。
语气：疲惫、讽刺、偶尔无奈，常引用"Siempre lo mismo"（总是这样）。
用西班牙语和中文混合评论，100字以内。`
    },
    {
      name: 'María',
      label: '✊ 工会护士 · 52岁 · Kirchner 派',
      color: '#c0392b',
      prompt: `你是 María，52岁，公立医院护士，工会代表，庇隆主义者。
你认为 Milei 的政策在摧毁公共服务，对工薪阶层极度不公平。
情绪激烈，捍卫公共医疗、教育和退休金。
语气：愤怒、坚定、直接，常用感叹号，引用具体的工资数字或政策损失。
用西班牙语和中文混合评论，100字以内。`
    },
    {
      name: 'Facundo',
      label: '⚡ 自由派 IT 工程师 · 28岁 · Milei 支持者',
      color: '#b7860b',
      prompt: `你是 Facundo，28岁，自由软件工程师，Milei 的坚定支持者。
你相信自由市场、小政府、数据驱动决策。
对 Kirchner 主义深恶痛绝，认为补贴和国有化毁了阿根廷。
语气：好斗、引用数据、有时傲慢，喜欢用"但数字说明了一切"。
用西班牙语和中文混合评论，100字以内。`
    },
    {
      name: 'Valentina',
      label: '📱 Gen Z 大学生 · 22岁',
      color: '#2980b9',
      prompt: `你是 Valentina，22岁，布宜诺斯艾利斯大学生，学传播学。
对政治冷感但对社会议题（女权、气候、文化）敏感。
消费大量 TikTok 和 Instagram，用网络语言和表情包文化评论。
语气：自嘲、丧、偶尔犀利，常用"igual da lo mismo"（反正无所谓）。
用西班牙语和中文混合评论，100字以内。`
    },
  ];

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
            用 AI 将其转化为<strong>中文决策参考</strong>，供计划进入或已进入阿根廷市场的出海团队使用。
          </p>
          <p>
            不是新闻翻译，不是舆情监控。WooNews 关心的是：<strong>当地人在情绪上怎么看这件事，
            这对你的品牌或业务意味着什么。</strong>
          </p>
        </section>

        <section className="docs-section">
          <h2>数据来源</h2>
          <p>
            每日从 <strong>Clarín</strong>、<strong>La Nación</strong> RSS 抓取当日热点，
            结合 <strong>Twitter/X</strong> 阿根廷热门话题，
            经 AI 筛选、合并、去重，最终提炼 5–7 个话题。
          </p>
          <p>
            每个话题附带：中文标题、一句解读、出海建议、文化背景，
            以及 4 个本地用户画像对该话题的真实反应模拟。
          </p>
        </section>

        <section className="docs-section">
          <h2>广场人物画像</h2>
          <p>
            "广场"是 WooNews 的核心功能——4 个虚构的阿根廷人，
            代表当地最真实的四种声音。他们的评论由 AI 根据各自的提示词生成，
            以下是完整的提示词，完全公开。
          </p>
          {personas.map(p => (
            <div key={p.name} className="persona-card">
              <div className="persona-card-header">
                <span className="persona-card-name" style={{ color: p.color }}>{p.name}</span>
                <span className="persona-card-label">{p.label}</span>
              </div>
              <pre className="persona-prompt">{p.prompt}</pre>
            </div>
          ))}
        </section>

        <section className="docs-section">
          <h2>技术架构</h2>
          <p>
            数据采集运行在 Mac mini（本地），AI 解读使用 Claude（Anthropic），
            数据存储在 <strong>Supabase</strong>，前端部署在 <strong>Vercel</strong>。
            每天 07:00 自动运行完整流程。
          </p>
          <p>
            代码开源于 <a href="https://github.com/wInTheNewWorld/woonews" target="_blank" rel="noopener noreferrer" style={{color:'var(--ink-sub)'}}>GitHub →</a>
          </p>
        </section>

        <footer className="site-footer">WooNews · Built by WooWoo</footer>
      </div>
    </main>
  );
}
