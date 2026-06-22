'use client';

import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { EventItem, Reminder, Task } from '@/types/database';
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  ChevronRight,
  Moon,
  Search,
  UserCircle
} from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Page() {
  const tasks = useSupabaseTable<Task>('tasks');
  const events = useSupabaseTable<EventItem>('events');
  const reminders = useSupabaseTable<Reminder>('reminders');

  const today = new Date().toISOString().slice(0, 10);
  const done = tasks.rows.filter((t) => t.status === 'concluida').length;
  const pending = tasks.rows.filter((t) => t.status === 'pendente').length;
  const inProgress = tasks.rows.filter((t) => t.status === 'em_andamento').length;
  const overdue = tasks.rows.filter((t) => t.due_date && t.due_date < today && t.status !== 'concluida').length;
  const unreadReminders = reminders.rows.filter((r) => !r.is_read).length;

  const data = [
    { name: 'Pendentes', valor: pending },
    { name: 'Andamento', valor: inProgress },
    { name: 'Concluídas', valor: done },
    { name: 'Atrasadas', valor: overdue }
  ];

  return (
    <div className="dashboard-premium">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Resumo do dia, tarefas, eventos, lembretes e produtividade.</p>
        </div>
        <div className="dashboard-actions">
          <button aria-label="Buscar"><Search size={22} /></button>
          <button aria-label="Notificações" className="has-dot"><Bell size={22} /></button>
          <button aria-label="Tema"><Moon size={22} /></button>
          <button className="user-chip" aria-label="Usuário"><span>W</span><b>Wesley</b><UserCircle size={20} /></button>
        </div>
      </header>

      <section className="premium-stat-grid">
        <StatCard icon={<CheckSquare />} label="Tarefas" value={tasks.rows.length} sub="Pendentes" color="blue" />
        <StatCard icon={<CheckCircle2 />} label="Concluídas" value={done} sub="Hoje" color="green" />
        <StatCard icon={<Clock3 />} label="Atrasadas" value={overdue} sub="Atrasadas" color="orange" />
        <StatCard icon={<Bell />} label="Lembretes" value={unreadReminders} sub="Próximos" color="purple" />
      </section>

      <section className="dashboard-content-grid">
        <div className="premium-panel chart-panel">
          <div className="panel-title-row">
            <div className="panel-title">
              <span className="panel-icon blue"><BarChart3 size={24} /></span>
              <h2>Produtividade semanal</h2>
            </div>
            <button className="week-filter"><CalendarDays size={18} /> Esta semana</button>
          </div>
          <div className="premium-chart-wrap">
            <ResponsiveContainer>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="valor" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-panel today-panel">
          <div className="panel-title-row">
            <div className="panel-title">
              <span className="panel-icon blue"><CalendarDays size={24} /></span>
              <h2>Hoje</h2>
            </div>
          </div>
          <TodayRow icon={<CheckSquare />} label="Tarefas do dia" value={tasks.rows.filter((t) => t.due_date === today).length} color="blue" />
          <TodayRow icon={<CalendarDays />} label="Eventos da semana" value={events.rows.length} color="green" />
          <TodayRow icon={<Bell />} label="Lembretes próximos" value={reminders.rows.length} color="purple" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: number; sub: string; color: 'blue' | 'green' | 'orange' | 'purple' }) {
  return (
    <article className={`premium-stat-card ${color}`}>
      <span className="stat-icon">{icon}</span>
      <div>
        <h3>{label}</h3>
        <strong>{value}</strong>
        <small>{sub}</small>
      </div>
    </article>
  );
}

function TodayRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: 'blue' | 'green' | 'purple' }) {
  return (
    <div className={`today-row ${color}`}>
      <span>{icon}</span>
      <b>{label}</b>
      <strong>{value}</strong>
      <ChevronRight size={20} />
    </div>
  );
}
