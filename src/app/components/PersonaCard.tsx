'use client';
import { useState, useEffect } from 'react';

interface Props {
  personaKey: string;
  name: string;
  label: string;
  color: string;
  soul: string;
  autoOpen?: boolean;
}

export function PersonaCard({ personaKey, name, label, color, soul, autoOpen }: Props) {
  const [open, setOpen] = useState(false);

  // 如果 URL hash 匹配，自动展开
  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  return (
    <div id={personaKey} className="persona-card-collapsible">
      <button
        className="persona-card-header-btn"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="persona-card-identity">
          <span className="persona-card-name" style={{ color }}>{name}</span>
          <span className="persona-card-label">{label}</span>
        </div>
        <span className="persona-toggle-icon">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="persona-soul-content">
          <pre className="persona-prompt">{soul}</pre>
        </div>
      )}
    </div>
  );
}
