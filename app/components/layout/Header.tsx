// components/layout/Header.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import { MdMenu, MdPerson, MdLogout, MdExpandMore } from 'react-icons/md';

interface HeaderProps {
  collapsed:   boolean;
  onToggle:    () => void;
}

export default function Header({ collapsed, onToggle }: HeaderProps) {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const sidebarWidth = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <header
      style={{
        position:   'fixed',
        top:        0,
        left:       sidebarWidth,
        right:      0,
        height:     'var(--header-height)',
        background: '#fff',
        borderBottom: '1px solid var(--border-color)',
        display:    'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding:    '0 20px',
        zIndex:     99,
        transition: 'left 0.25s ease',
        boxShadow:  'var(--shadow-sm)',
      }}
    >
      {/* Left — toggle + page context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border:     'none',
            cursor:     'pointer',
            color:      'var(--text-muted)',
            padding:    4,
            borderRadius: 6,
            display:    'flex',
            alignItems: 'center',
          }}
        >
          <MdMenu size={22} />
        </button>

        {/* Hotel logo */}
        {session?.user?.client?.logo_path ? (
          <Image
            src={session.user.client.logo_path}
            alt={session.user.client.name}
            width={32}
            height={32}
            style={{ borderRadius: 6, objectFit: 'contain' }}
          />
        ) : (
          <div style={{
            width:        32,
            height:       32,
            borderRadius: 6,
            background:   'var(--primary-muted)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontWeight:   700,
            fontSize:     '0.85rem',
            color:        'var(--primary)',
          }}>
            {session?.user?.client?.name?.[0]?.toUpperCase() ?? 'H'}
          </div>
        )}

        <span style={{
          fontWeight: 600,
          fontSize:   '0.95rem',
          color:      'var(--text-main)',
        }}>
          {session?.user?.client?.name ?? 'Hotel'}
        </span>
      </div>

      {/* Right — user dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setDropdownOpen(o => !o)}
          style={{
            background:   'var(--primary-bg)',
            border:       '1px solid var(--border-color)',
            borderRadius: 8,
            padding:      '6px 12px',
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            gap:          8,
          }}
        >
          <div style={{
            width:        30,
            height:       30,
            borderRadius: '50%',
            background:   'var(--primary)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            color:        '#fff',
            fontWeight:   600,
            fontSize:     '0.8rem',
          }}>
            {session?.user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.2 }}>
              {session?.user?.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
              {session?.user?.role}
            </div>
          </div>
          <MdExpandMore size={16} color="var(--text-muted)" />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setDropdownOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 98 }}
            />
            <div style={{
              position:   'absolute',
              right:      0,
              top:        'calc(100% + 8px)',
              background: '#fff',
              border:     '1px solid var(--border-color)',
              borderRadius: 10,
              boxShadow:  'var(--shadow-md)',
              minWidth:   220,
              zIndex:     99,
              overflow:   'hidden',
            }}>
              {/* User info */}
              <div style={{
                padding:      '14px 16px',
                borderBottom: '1px solid var(--border-color)',
                background:   'var(--primary-bg)',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {session?.user?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {session?.user?.email}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  width:      '100%',
                  padding:    '11px 16px',
                  background: 'none',
                  border:     'none',
                  cursor:     'pointer',
                  display:    'flex',
                  alignItems: 'center',
                  gap:        10,
                  color:      'var(--danger)',
                  fontSize:   '0.88rem',
                  fontWeight: 500,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <MdLogout size={17} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}