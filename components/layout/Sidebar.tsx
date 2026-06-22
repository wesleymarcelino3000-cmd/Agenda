
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Bell,
  Tags,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { href: "/lembretes", label: "Lembretes", icon: Bell },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      <div className="mobile-topbar">
        <button className="mobile-menu-button" onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu size={22} />
        </button>
        <strong>Agenda <span style={{ color: "#2563eb" }}>Pro</span></strong>
        <span style={{ width: 44 }} />
      </div>

      {open && <div className="mobile-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <Image
            src="/logo-agenda-pro.png"
            alt="Agenda Pro"
            width={48}
            height={48}
            className="brand-logo"
            priority
          />
          <div>
            <h1 className="brand-title">Agenda <span>Pro</span></h1>
          </div>
          <button
            className="mobile-menu-button"
            style={{ marginLeft: "auto" }}
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button className="logout-button" onClick={handleLogout}>
            <LogOut />
            <span>Sair</span>
          </button>
        </nav>

        <div className="sidebar-wave" />
      </aside>
    </>
  );
}
