
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [stats, setStats] = useState({ tasks: 0, completed: 0, late: 0, reminders: 0 });

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const [{ data: tasks }, { data: reminders }] = await Promise.all([
        supabase.from("tasks").select("*").eq("user_id", userId),
        supabase.from("reminders").select("*").eq("user_id", userId),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      setStats({
        tasks: tasks?.filter((t) => t.status !== "concluida").length ?? 0,
        completed: tasks?.filter((t) => t.status === "concluida").length ?? 0,
        late: tasks?.filter((t) => t.due_date && t.due_date < today && t.status !== "concluida").length ?? 0,
        reminders: reminders?.filter((r) => !r.is_read).length ?? 0,
      });
    }
    load();
  }, []);

  return (
    <section>
      <div className="page-top">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-description">Resumo do dia, tarefas, eventos, lembretes e produtividade.</p>
        </div>

        <div className="top-actions">
          <button className="icon-button" aria-label="Pesquisar"><Search size={21} /></button>
          <button className="icon-button" aria-label="Notificações"><Bell size={21} /></button>
          <button className="icon-button" aria-label="Tema"><Moon size={21} /></button>
          <button className="user-pill"><span className="avatar">W</span> Wesley</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ "--accent": "#2563eb", "--icon-bg": "#dbeafe" } as any}>
          <div className="stat-icon"><CheckSquare /></div>
          <div><div className="stat-label">Tarefas</div><div className="stat-value">{stats.tasks}</div><div className="stat-sub">Pendentes</div></div>
        </div>
        <div className="stat-card" style={{ "--accent": "#16a34a", "--icon-bg": "#dcfce7" } as any}>
          <div className="stat-icon"><CheckCircle2 /></div>
          <div><div className="stat-label">Concluídas</div><div className="stat-value">{stats.completed}</div><div className="stat-sub">Hoje</div></div>
        </div>
        <div className="stat-card" style={{ "--accent": "#f59e0b", "--icon-bg": "#ffedd5" } as any}>
          <div className="stat-icon"><Clock3 /></div>
          <div><div className="stat-label">Atrasadas</div><div className="stat-value">{stats.late}</div><div className="stat-sub">Atrasadas</div></div>
        </div>
        <div className="stat-card" style={{ "--accent": "#7c3aed", "--icon-bg": "#f3e8ff" } as any}>
          <div className="stat-icon"><Bell /></div>
          <div><div className="stat-label">Lembretes</div><div className="stat-value">{stats.reminders}</div><div className="stat-sub">Próximos</div></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title"><span className="card-title-icon"><BarChart3 /></span>Produtividade semanal</h2>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <select className="week-select" defaultValue="semana"><option value="semana">Esta semana</option><option value="mes">Este mês</option></select>
              <MoreVertical size={21} color="#64748b" />
            </div>
          </div>
          <div className="chart-area"></div>
          <div className="chart-labels"><span>Pendentes</span><span>Andamento</span><span>Concluídas</span><span>Atrasadas</span></div>
        </div>

        <div className="content-card">
          <div className="card-header"><h2 className="card-title"><span className="card-title-icon"><CalendarDays /></span>Hoje</h2></div>
          <div className="today-list">
            <div className="today-item"><div className="today-left"><CheckSquare color="#2563eb" /> Tarefas do dia</div><strong style={{ color: "#2563eb" }}>{stats.tasks}</strong></div>
            <div className="today-item"><div className="today-left"><CalendarDays color="#16a34a" /> Eventos da semana</div><strong style={{ color: "#16a34a" }}>0</strong></div>
            <div className="today-item"><div className="today-left"><Bell color="#7c3aed" /> Lembretes próximos</div><strong style={{ color: "#7c3aed" }}>{stats.reminders}</strong></div>
          </div>
        </div>
      </div>
    </section>
  );
}
