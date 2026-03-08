'use client';
import { useState, useEffect, useCallback } from 'react';
import './globals.css';

interface Comment {
  id: string; persona: string; content: string; reply_to: string | null;
}
interface Topic {
  id: string; title_es: string; title_zh: string; explanation: string;
  business_impact: string; mood: string;
  cultural_context: string; links: string[];
  persona_comments: Comment[];
}
interface DailyData { date: string; topics: Topic[]; }

const PERSONA_META: Record<string, { initial: string; label: string; }> = {
  middle_class:       { initial: 'C', label: 'Carlos · 中产' },
  kirchner:           { initial: 'M', label: 'María · 工会'  },
  milei:              { initial: 'F', label: 'Facundo · 自由派' },
  genz:               { initial: 'V', label: 'Valentina · Gen Z' },
  middle_class_reply: { initial: 'C', label: 'Carlos' },
  kirchner_reply:     { initial: 'M', label: 'María'  },
  milei_reply:        { initial: 'F', label: 'Facundo' },
  genz_reply:         { initial: 'V', label: 'Valentina' },
};

function Plaza({ comments }: { comments: Comment[] }) {
  if (!comments.length) return null;
  const mainComments = comments.filter(c => !c.reply_to);
  const replies = comments.filter(c => c.reply_to);

  return (
    <div className="plaza">
      {mainComments.map(c => {
        const meta = PERSONA_META[c.persona] || { initial: '?', label: c.persona };
        const basePersona = c.persona.replace('_reply', '');
        const reply = replies.find(r => r.reply_to === c.id);
        const replyMeta = reply ? (PERSONA_META[reply.persona] || { initial: '?', label: reply.persona }) : null;
        const replyBase = reply?.persona.replace('_reply', '');

        return (
          <div key={c.id} className="comment-thread">
            <div className="comment-bubble">
              <div className="comment-header">
                <div className={`persona-avatar avatar-${basePersona}`}>{meta.initial}</div>
                <span className="comment-name">{meta.label}</span>
              </div>
              <p className="comment-content">{c.content}</p>
            </div>
            {reply && replyMeta && (
              <div className="comment-reply-wrap">
                <div className="comment-reply-bubble">
                  <div className="comment-header">
                    <div className={`persona-avatar avatar-${replyBase}`}>{replyMeta.initial}</div>
                    <span className="comment-name">{replyMeta.label}</span>
                  </div>
                  <p className="comment-content">{reply.content}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const [showCultural, setShowCultural] = useState(false);
  const links: string[] = topic.links || [];

  return (
    <div className={`topic-card mood-${topic.mood?.toLowerCase()}`}>
      {/* 顶部：原文链接 */}
      {links.length > 0 && (
        <div className="card-top-row">
          <a href={links[0]} target="_blank" rel="noopener noreferrer" className="source-link">
            原文 ↗
          </a>
        </div>
      )}

      {/* 新闻标题 + 一句解读 */}
      <p className="topic-title-zh">{topic.title_zh || topic.explanation}</p>
      {topic.explanation && <p className="topic-explanation">{topic.explanation}</p>}

      {/* 分割线 */}
      <hr className="card-divider" />

      {/* 广场：默认展开，核心区域 */}
      <Plaza comments={topic.persona_comments || []} />

      {/* 底部：业务建议 + 文化背景折叠 */}
      <div className="card-bottom">
        {topic.business_impact && <p className="topic-impact">{topic.business_impact}</p>}
        {topic.cultural_context && (
          <>
            <button className="toggle-btn" onClick={() => setShowCultural(o => !o)}>
              🏛️ 文化背景 {showCultural ? '↑' : '↓'}
            </button>
            {showCultural && <p className="cultural-text">{topic.cultural_context}</p>}
          </>
        )}
      </div>
    </div>
  );
}

function formatDate(d: string) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const [y, m, day] = d.split('-');
  return `${months[parseInt(m)-1]} ${parseInt(day)}, ${y}`;
}

export default function Home() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark'|'light'>('dark');

  useEffect(() => {
    fetch('/api/daily').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  if (loading) return <main><div className="container"><div className="loading">Loading...</div></div></main>;
  if (!data || !data.topics.length) return <main><div className="container"><div className="empty">No data</div></div></main>;

  const totalComments = data.topics.reduce((sum, t) => sum + (t.persona_comments?.length || 0), 0);

  return (
    <main>
      <div className="container">
        <header>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <h1>🇦🇷 WooNews</h1>
          <p className="header-tagline">今天布宜诺斯艾利斯的人在谈论什么</p>
          <p className="header-meta">
            {formatDate(data.date)} &nbsp;·&nbsp;
            <strong>{data.topics.length}</strong> 个话题 &nbsp;·&nbsp;
            <strong>{totalComments}</strong> 条声音
          </p>
        </header>

        <div className="topics-header">今日话题</div>
        {data.topics.map(t => <TopicCard key={t.id} topic={t} />)}

        <footer>Clarín · La Nación · Twitter &nbsp;·&nbsp; Built by WooWoo</footer>
      </div>
    </main>
  );
}
