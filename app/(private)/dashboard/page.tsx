"use client";

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  MoreVertical,
  Search,
  Moon,
  BarChart3,
  LogOut,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  tasks: number;
  completed: number;
  late: number;
  reminders: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    tasks: 0,
    completed: 0,
    late: 0,
    reminders: 0,
  });

  const [profileName, setProfileName] = useState("Usuário");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [darkPreview, setDarkPreview] = useState(false);

  const avatarLetter = useMemo(() => {
    const baseName = profileName || profileEmail || "U";
    return baseName.trim().slice(0, 1).toUpperCase();
  }, [profileName, profileEmail]);

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const email = user.email ?? "";
      setProfileEmail(email);

      const { data: profile } = await supabase
        .from("profiles")
        .select("name,email")
        .eq("id", user.id)
        .maybeSingle();

      const userName =
        profile?.name ||
        user.user_metadata?.name ||
        email.split("@")[0] ||
        "Usuário";

      setProfileName(userName);

      const [{ data: tasks }, { data: reminders }, { data: events }] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", user.id),
        supabase.from("reminders").select("*").eq("user_id", user.id),
        supabase.from("events").select("*").eq("user_id", user.id),
      ]);

      const today = new Date().toISOString().slice(0, 10);

      setStats({
        tasks: tasks?.filter((task) => task.status !== "concluida").length ?? 0,
        completed: tasks?.filter((task) => task.status === "concluida").length ?? 0,
        late:
          tasks?.filter(
            (task) =>
              task.due_date &&
              task.due_date < today &&
              task.status !== "concluida"
          ).length ?? 0,
        reminders: reminders?.filter((reminder) => !reminder.is_read).length ?? 0,
      });
    }

    loadDashboard();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = search.trim();

    if (!term) return;

    router.push(`/tarefas?busca=${encodeURIComponent(term)}`);
  }

  return (
    <section className={darkPreview ? "dashboard-dark-preview" : ""}>
      <div className="page-top">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">
            Resumo do dia, tarefas, eventos, lembretes e produtividade.
          </p>
        </div>

        <div className="top-actions dashboard-actions">
          {searchOpen && (
            <form className="dashboard-search" onSubmit={handleSearchSubmit}>
              <Search size={18} />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar tarefas..."
              />
              <button type="button" onClick={() => setSearchOpen(false)}>
                <X size={16} />
              </button>
            </form>
          )}

          <button
            className="icon-button"
            aria-label="Pesquisar"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search size={21} />
          </button>

          <button
            className="icon-button dashboard-bell"
            aria-label="Lembretes"
            onClick={() => router.push("/lembretes")}
          >
            <Bell size={21} />
            {stats.reminders > 0 && <span>{stats.reminders}</span>}
          </button>

          <button
            className="icon-button"
            aria-label="Tema"
            onClick={() => setDarkPreview((value) => !value)}
            title="Alternar prévia claro/escuro"
          >
            <Moon size={21} />
          </button>

          <div className="profile-menu-wrap">
            <button
              className="user-pill"
              onClick={() => setProfileOpen((value) => !value)}
              aria-label="Abrir menu do usuário"
            >
              <span className="avatar">{avatarLetter}</span>
              <span>{profileName}</span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-header">
                  <strong>{profileName}</strong>
                  <small>{profileEmail}</small>
                </div>

                <button onClick={() => router.push("/configuracoes")}>
                  <Settings size={18} />
                  Configurações
                </button>

                <button onClick={() => router.push("/configuracoes")}>
                  <UserCircle size={18} />
                  Meu perfil
                </button>

                <button onClick={handleLogout} className="danger">
                  <LogOut size={18} />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div
          className="stat-card"
          style={{ "--accent": "#2563eb", "--icon-bg": "#dbeafe" } as React.CSSProperties}
        >
          <div className="stat-icon">
            <CheckSquare />
          </div>
          <div>
            <div className="stat-label">Tarefas</div>
            <div className="stat-value">{stats.tasks}</div>
            <div className="stat-sub">Pendentes</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--accent": "#16a34a", "--icon-bg": "#dcfce7" } as React.CSSProperties}
        >
          <div className="stat-icon">
            <CheckCircle2 />
          </div>
          <div>
            <div className="stat-label">Concluídas</div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-sub">Hoje</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--accent": "#f59e0b", "--icon-bg": "#ffedd5" } as React.CSSProperties}
        >
          <div className="stat-icon">
            <Clock3 />
          </div>
          <div>
            <div className="stat-label">Atrasadas</div>
            <div className="stat-value">{stats.late}</div>
            <div className="stat-sub">Atrasadas</div>
          </div>
        </div>

        <div
          className="stat-card"
          style={{ "--accent": "#7c3aed", "--icon-bg": "#f3e8ff" } as React.CSSProperties}
        >
          <div className="stat-icon">
            <Bell />
          </div>
          <div>
            <div className="stat-label">Lembretes</div>
            <div className="stat-value">{stats.reminders}</div>
            <div className="stat-sub">Próximos</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-title-icon">
                <BarChart3 />
              </span>
              Produtividade semanal
            </h2>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select className="week-select" defaultValue="semana">
                <option value="semana">Esta semana</option>
                <option value="mes">Este mês</option>
              </select>
              <MoreVertical size={21} color="#64748b" />
            </div>
          </div>

          <div className="chart-area" />
          <div className="chart-labels">
            <span>Pendentes</span>
            <span>Andamento</span>
            <span>Concluídas</span>
            <span>Atrasadas</span>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-title-icon">
                <CalendarDays />
              </span>
              Hoje
            </h2>
          </div>

          <div className="today-list">
            <button className="today-item" onClick={() => router.push("/tarefas")}>
              <div className="today-left">
                <CheckSquare color="#2563eb" /> Tarefas do dia
              </div>
              <strong style={{ color: "#2563eb" }}>{stats.tasks}</strong>
            </button>

            <button className="today-item" onClick={() => router.push("/calendario")}>
              <div className="today-left">
                <CalendarDays color="#16a34a" /> Eventos da semana
              </div>
              <strong style={{ color: "#16a34a" }}>0</strong>
            </button>

            <button className="today-item" onClick={() => router.push("/lembretes")}>
              <div className="today-left">
                <Bell color="#7c3aed" /> Lembretes próximos
              </div>
              <strong style={{ color: "#7c3aed" }}>{stats.reminders}</strong>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
