// components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdDashboard,
  MdBookOnline,
  MdReceiptLong,
} from 'react-icons/md';

interface NavItem {
  label:  string;
  href:   string;
  icon:   React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/',          icon: <MdDashboard size={20} /> },
  { label: 'Bookings',  href: '/bookings',  icon: <MdBookOnline size={20} /> },
  { label: 'Expenses',  href: '/expenses',  icon: <MdReceiptLong size={20} /> },
];

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width:           collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        minHeight:       '100vh',
        background:      '#fff',
        borderRight:     '1px solid var(--border-color)',
        transition:      'width 0.25s ease',
        overflow:        'hidden',
        display:         'flex',
        flexDirection:   'column',
        position:        'fixed',
        top:             0,
        left:            0,
        zIndex:          100,
        boxShadow:       'var(--shadow-sm)',
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height:         'var(--header-height)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding:        collapsed ? '0' : '0 20px',
          borderBottom:   '1px solid var(--border-color)',
          background:     'var(--primary-bg)',
        }}
      >
        {!collapsed && (
          <span style={{
            fontWeight: 700,
            fontSize:   '1.1rem',
            color:      'var(--primary)',
            whiteSpace: 'nowrap',
          }}>
            HMS
          </span>
        )}
        {collapsed && (
          <span style={{
            fontWeight: 700,
            fontSize:   '1.1rem',
            color:      'var(--primary)',
          }}>
            H
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ padding: '12px 0', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : ''}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '12px',
                padding:        collapsed ? '12px 0' : '11px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                margin:         '2px 8px',
                borderRadius:   '8px',
                textDecoration: 'none',
                fontWeight:     active ? 600 : 400,
                fontSize:       '0.92rem',
                color:          active ? 'var(--primary)' : 'var(--text-muted)',
                background:     active ? 'var(--primary-muted)' : 'transparent',
                transition:     'all 0.15s ease',
                whiteSpace:     'nowrap',
              }}
              onMouseEnter={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--primary-bg)';
              }}
              onMouseLeave={e => {
                if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <span style={{ color: active ? 'var(--primary)' : 'var(--text-muted)', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom version tag */}
      {!collapsed && (
        <div style={{
          padding:    '12px 20px',
          fontSize:   '0.75rem',
          color:      'var(--text-muted)',
          borderTop:  '1px solid var(--border-color)',
        }}>
          HMS v1.0.0
        </div>
      )}
    </aside>
  );
}