'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CheckSquare, LayoutDashboard, Bell, Tags, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const items = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/calendario', 'Calendário', CalendarDays],
  ['/tarefas', 'Tarefas', CheckSquare],
  ['/lembretes', 'Lembretes', Bell],
  ['/categorias', 'Categorias', Tags],
  ['/configuracoes', 'Config.', Settings]
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="layout">
      <button className="btn secondary mobile-menu" aria-label="Abrir menu" onClick={() => setOpen(true)}>
        <Menu size={20} /> Menu
      </button>
      {open && <button className="mobile-overlay" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <Side open={open} close={() => setOpen(false)} />
      <main className="main">{children}</main>
      <MobileBottomNav />
    </div>
  );
}

function Side({ open, close }: { open: boolean; close: () => void }) {
  const path = usePathname();
  const { signOut } = useAuth();
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">Agenda Pro</div>
      <nav className="nav">
        {items.map(([href, label, Icon]) => (
          <Link key={href} className={path.startsWith(href) ? 'active' : ''} href={href} onClick={close}>
            <Icon size={18} /> {label}
          </Link>
        ))}
        <button onClick={signOut}><LogOut size={18} /> Sair</button>
      </nav>
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
          <span>{label}</span>
        </Link>
      ))}
      <button onClick={signOut} aria-label="Sair"><LogOut size={20} /><span>Sair</span></button>
    </nav>
  );
}
