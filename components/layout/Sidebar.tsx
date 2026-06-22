'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Tags,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const items = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/calendario', 'Calendário', CalendarDays],
  ['/tarefas', 'Tarefas', CheckSquare],
  ['/lembretes', 'Lembretes', Bell],
  ['/categorias', 'Categorias', Tags],
  ['/configuracoes', 'Configurações', Settings]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="layout premium-layout">
      <button className="mobile-menu floating-mobile-menu" aria-label="Abrir menu" onClick={() => setOpen(true)}>
        <Menu size={22} />
      </button>
      {open && <button className="mobile-overlay" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <Side open={open} close={() => setOpen(false)} />
      <main className="main premium-main">{children}</main>
      <MobileBottomNav />
    </div>
  );
}

function Side({ open, close }: { open: boolean; close: () => void }) {
  const path = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className={`sidebar premium-sidebar ${open ? 'open' : ''}`}>
      <button className="sidebar-close" aria-label="Fechar menu" onClick={close}>
        <X size={20} />
      </button>

      <Link href="/dashboard" className="premium-brand" onClick={close}>
        <span className="premium-brand-mark">
          <Image src="/logo-agenda-pro.png" alt="Agenda Pro" width={52} height={52} priority />
        </span>
        <span className="premium-brand-text">
          <strong>Agenda <b>Pro</b></strong>
          <small>Organize. Planeje. Realize.</small>
        </span>
      </Link>

      <nav className="nav premium-nav">
        {items.map(([href, label, Icon]) => (
          <Link key={href} className={path.startsWith(href) ? 'active' : ''} href={href} onClick={close}>
            <Icon size={21} />
            <span>{label}</span>
          </Link>
        ))}
        <button onClick={signOut}>
          <LogOut size={21} />
          <span>Sair</span>
        </button>
      </nav>

      <div className="sidebar-version-card">
        <Image src="/logo-agenda-pro.png" alt="Agenda Pro" width={56} height={56} />
        <div>
          <strong>Agenda <b>Pro</b></strong>
          <span>Versão 1.0.0</span>
        </div>
      </div>
    </aside>
  );
}

function MobileBottomNav() {
  const path = usePathname();
  const { signOut } = useAuth();
  const mobileItems = items.slice(0, 5);

  return (
    <nav className="mobile-bottom-nav" aria-label="Menu mobile">
      {mobileItems.map(([href, label, Icon]) => (
        <Link key={href} className={path.startsWith(href) ? 'active' : ''} href={href}>
          <Icon size={20} />
          <span>{label.split(' ')[0]}</span>
        </Link>
      ))}
      <button onClick={signOut} aria-label="Sair">
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </nav>
  );
}
