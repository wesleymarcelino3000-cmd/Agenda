'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  Bell,
  Tags,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const items = [
  ['/dashboard', 'Dashboard', LayoutDashboard],
  ['/calendario', 'Calendário', CalendarDays],
  ['/tarefas', 'Tarefas', CheckSquare],
  ['/lembretes', 'Lembretes', Bell],
  ['/categorias', 'Categorias', Tags],
  ['/configuracoes', 'Configurações', Settings],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="auth auth-premium">
        <div className="auth-bg-shape auth-bg-shape-one" />
        <div className="auth-bg-shape auth-bg-shape-two" />
        <div className="auth-card auth-card-premium" style={{ textAlign: 'center' }}>
          <h1>Carregando...</h1>
          <p>Verificando sua sessão.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="layout">
      <button className="btn secondary mobile-menu" onClick={() => setOpen(true)}>
        <Menu size={18} />
      </button>
      <Side open={open} close={() => setOpen(false)} />
      <main className="main">{children}</main>
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
        <button onClick={signOut}>
          <LogOut size={18} /> Sair
        </button>
      </nav>
    </aside>
  );
}
