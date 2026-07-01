// components/layout/AppShell.tsx
'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header  from './Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handler = () => setCollapsed(window.innerWidth < 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar — fixed, doesn't affect flow */}
      <Sidebar collapsed={collapsed} />

      {/* Main area — takes remaining width, scrolls vertically only */}
      <div
        style={{
          marginLeft:   collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          flex:         1,
          display:      'flex',
          flexDirection:'column',
          minWidth:     0,          // ← critical: prevents flex child overflow
          width:        0,          // ← forces it to respect flex boundaries
          transition:   'margin-left 0.25s ease',
          overflowX:    'hidden',   // ← never scroll the page horizontally
          overflowY:    'auto',     // ← page scrolls vertically
        }}
      >
        <Header collapsed={collapsed} onToggle={() => setCollapsed(o => !o)} />
        <main
          style={{
            marginTop: 'var(--header-height)',
            padding:   '24px',
            flex:      1,
            minWidth:  0,           // ← same here
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}