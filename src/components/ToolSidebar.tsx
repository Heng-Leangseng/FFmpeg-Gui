import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toolCatalog, getAllOperations, ToolOperation } from '../config/toolCatalog';

interface ToolSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOperation: (op: ToolOperation & { category: string; subcategory: string }) => void;
  isEncoding: boolean;
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const ToolSidebarTrigger: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button className="ib" aria-label="Open tools menu" onClick={onClick}>
    <MenuIcon />
  </button>
);

export const ToolSidebar: React.FC<ToolSidebarProps> = ({ isOpen, onClose, onSelectOperation, isEncoding }) => {
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [expandedSubs, setExpandedSubs] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const allOps = useMemo(() => getAllOperations(), []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return allOps.filter(
      (op) =>
        op.name.toLowerCase().includes(q) ||
        op.subcategory.toLowerCase().includes(q) ||
        op.category.toLowerCase().includes(q)
    );
  }, [search, allOps]);

  useEffect(() => {
    if (isOpen) {
      lastTriggerRef.current = document.activeElement as HTMLElement;
      setTimeout(() => firstFocusRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && sidebarRef.current) {
        const focusable = sidebarRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen && lastTriggerRef.current) {
      try {
        lastTriggerRef.current.focus();
      } catch {}
    }
  }, [isOpen]);

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSub = (id: string) => {
    setExpandedSubs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpClick = (op: ToolOperation & { category: string; subcategory: string }) => {
    if (isEncoding) {
      alert('A job is running. Cancel it first or wait for it to finish.');
      return;
    }
    onSelectOperation(op);
    onClose();
  };

  const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 999,
          }}
        />
      )}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tool navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100dvh',
          width: 'min(85vw, 380px)',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: reduceMotion ? 'none' : 'transform 140ms ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <button ref={firstFocusRef} className="ib" aria-label="Close tools menu" onClick={onClose}>
            <CloseIcon />
          </button>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>Tools</div>
        </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            style={{
              width: '100%',
              height: '42px',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              padding: '0 10px',
              fontFamily: 'var(--sans)',
              fontSize: '14px',
            }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {searchResults !== null ? (
            <div style={{ padding: '8px 0' }}>
              {searchResults.length === 0 && (
                <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>No results</div>
              )}
              {searchResults.map((op) => (
                <button
                  key={op.id}
                  onClick={() => handleOpClick(op)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    padding: '10px 16px 10px 20px',
                    fontFamily: 'var(--sans)',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div>{op.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {op.category} / {op.subcategory}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: op.status === 'available' ? 'var(--accent)' : 'var(--text-dim)' }}>{op.status}</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {toolCatalog.map((cat) => (
                <div key={cat.id}>
                  <button
                    onClick={() => toggleCat(cat.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text)',
                      padding: '10px 16px',
                      fontFamily: 'var(--sans)',
                      fontSize: '15px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <ChevronIcon open={!!expandedCats[cat.id]} />
                    {cat.name}
                  </button>
                  {expandedCats[cat.id] &&
                    cat.subcategories.map((sub) => (
                      <div key={sub.id}>
                        <button
                          onClick={() => toggleSub(sub.id)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text)',
                            padding: '8px 16px 8px 28px',
                            fontFamily: 'var(--sans)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <ChevronIcon open={!!expandedSubs[sub.id]} />
                          {sub.name}
                        </button>
                        {expandedSubs[sub.id] &&
                          sub.operations.map((op) => (
                            <button
                              key={op.id}
                              onClick={() => handleOpClick({ ...op, category: cat.name, subcategory: sub.name })}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text)',
                                padding: '7px 16px 7px 44px',
                                fontFamily: 'var(--sans)',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>{op.name}</span>
                              <span style={{ fontSize: '9px', color: op.status === 'available' ? 'var(--accent)' : 'var(--text-dim)' }}>{op.status}</span>
                            </button>
                          ))}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
