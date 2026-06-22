'use client';

import { FormEvent, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, Bell, CheckSquare, CalendarCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { Category, EventItem, Reminder, Task, Priority } from '@/types/database';

type PlannerType = 'event' | 'task' | 'reminder';

type DayItem = {
  id: string;
  title: string;
  type: PlannerType;
  time?: string | null;
  status?: string;
};

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateBR(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function isSameDate(a: string | null | undefined, b: string) {
  return Boolean(a && a.slice(0, 10) === b);
}

export function CalendarPlanner() {
  const { user } = useAuth();
  const events = useSupabaseTable<EventItem>('events');
  const tasks = useSupabaseTable<Task>('tasks');
  const reminders = useSupabaseTable<Reminder>('reminders');
  const categories = useSupabaseTable<Category>('categories');

  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(toDateInput(today));
  const [type, setType] = useState<PlannerType>('event');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [priority, setPriority] = useState<Priority>('media');
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Array<{ date: string; label: number; current: boolean }> = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(year, month, 1 - (firstDay.getDay() - i));
      days.push({ date: toDateInput(d), label: d.getDate(), current: false });
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const d = new Date(year, month, day);
      days.push({ date: toDateInput(d), label: day, current: true });
    }

    let nextDay = 1;
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, nextDay);
      days.push({ date: toDateInput(d), label: d.getDate(), current: false });
      nextDay += 1;
    }

    return days;
  }, [currentMonth]);

  const allItemsByDate = useMemo(() => {
    const map = new Map<string, DayItem[]>();

    function add(date: string | null | undefined, item: DayItem) {
      if (!date) return;
      const key = date.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), item]);
    }

    events.rows.forEach((event) => add(event.start_date, { id: event.id, title: event.title, type: 'event', time: event.start_time, status: event.status }));
    tasks.rows.forEach((task) => add(task.due_date, { id: task.id, title: task.title, type: 'task', time: task.due_time, status: task.status }));
    reminders.rows.forEach((reminder) => add(reminder.reminder_datetime, { id: reminder.id, title: reminder.title, type: 'reminder', time: reminder.reminder_datetime?.slice(11, 16), status: reminder.is_read ? 'lido' : 'pendente' }));

    return map;
  }, [events.rows, tasks.rows, reminders.rows]);

  const selectedItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const items = allItemsByDate.get(selectedDate) ?? [];
    if (!query) return items;
    return items.filter((item) => item.title.toLowerCase().includes(query));
  }, [allItemsByDate, selectedDate, search]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !title.trim()) return;
    setSaving(true);

    try {
      const base = {
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category_id: categoryId || null,
        priority,
      };

      if (type === 'event') {
        await events.create({
          ...base,
          start_date: selectedDate,
          start_time: time || null,
          end_date: selectedDate,
          end_time: endTime || null,
          status: 'agendado',
        });
      }

      if (type === 'task') {
        await tasks.create({
          ...base,
          due_date: selectedDate,
          due_time: time || null,
          status: 'pendente',
          notes: null,
        });
      }

      if (type === 'reminder') {
        await reminders.create({
          user_id: user.id,
          task_id: null,
          event_id: null,
          title: title.trim(),
          reminder_datetime: `${selectedDate}T${time || '09:00'}:00`,
          type: 'personalizado',
          is_read: false,
        });
      }

      setTitle('');
      setDescription('');
      setType('event');
      setPriority('media');
      setCategoryId('');
      await Promise.all([events.refresh(), tasks.refresh(), reminders.refresh()]);
    } finally {
      setSaving(false);
    }
  }

  async function completeItem(item: DayItem) {
    if (item.type === 'event') await events.update(item.id, { status: 'concluido' });
    if (item.type === 'task') await tasks.update(item.id, { status: 'concluida' });
    if (item.type === 'reminder') await reminders.update(item.id, { is_read: true });
  }

  async function removeItem(item: DayItem) {
    if (!confirm(`Excluir "${item.title}"?`)) return;
    if (item.type === 'event') await events.remove(item.id);
    if (item.type === 'task') await tasks.remove(item.id);
    if (item.type === 'reminder') await reminders.remove(item.id);
  }

  function goMonth(direction: number) {
    setCurrentMonth((value) => new Date(value.getFullYear(), value.getMonth() + direction, 1));
  }

  return (
    <div className="planner-page">
      <div className="topbar planner-topbar">
        <div>
          <span className="planner-kicker">Agenda inteligente</span>
          <h1>Calendário</h1>
          <p className="muted">Selecione um dia para criar evento, tarefa ou lembrete diretamente no Supabase.</p>
        </div>
      </div>

      <div className="planner-shell">
        <section className="planner-calendar card">
          <div className="planner-calendar-header">
            <button className="icon-nav" type="button" onClick={() => goMonth(-1)} aria-label="Mês anterior"><ChevronLeft size={20} /></button>
            <div>
              <h2>{months[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
              <p className="muted">Clique em um dia para agendar</p>
            </div>
            <button className="icon-nav" type="button" onClick={() => goMonth(1)} aria-label="Próximo mês"><ChevronRight size={20} /></button>
          </div>

          <div className="planner-weekdays">
            {weekdays.map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="planner-month-grid">
            {monthDays.map((day) => {
              const items = allItemsByDate.get(day.date) ?? [];
              const active = day.date === selectedDate;
              const isToday = day.date === toDateInput(today);
              return (
                <button
                  type="button"
                  key={day.date}
                  className={`planner-day ${day.current ? '' : 'muted-day'} ${active ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => setSelectedDate(day.date)}
                >
                  <span className="planner-day-number">{day.label}</span>
                  <div className="planner-day-dots">
                    {items.slice(0, 3).map((item) => <span key={`${item.type}-${item.id}`} className={`dot ${item.type}`} />)}
                    {items.length > 3 && <small>+{items.length - 3}</small>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="planner-side">
          <form className="card planner-form" onSubmit={handleSubmit}>
            <div className="planner-side-title">
              <CalendarDays size={22} />
              <div>
                <h2>{formatDateBR(selectedDate)}</h2>
                <p className="muted">Novo agendamento</p>
              </div>
            </div>

            <div className="type-tabs">
              <button type="button" className={type === 'event' ? 'active' : ''} onClick={() => setType('event')}><CalendarCheck size={16} /> Evento</button>
              <button type="button" className={type === 'task' ? 'active' : ''} onClick={() => setType('task')}><CheckSquare size={16} /> Tarefa</button>
              <button type="button" className={type === 'reminder' ? 'active' : ''} onClick={() => setType('reminder')}><Bell size={16} /> Lembrete</button>
            </div>

            <label className="field compact">
              <span>Título</span>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Reunião com cliente" required />
            </label>

            {type !== 'reminder' && (
              <label className="field compact">
                <span>Descrição</span>
                <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do compromisso" rows={3} />
              </label>
            )}

            <div className="form-grid-2">
              <label className="field compact">
                <span><Clock size={14} /> Hora</span>
                <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
              {type === 'event' && (
                <label className="field compact">
                  <span>Final</span>
                  <input className="input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </label>
              )}
            </div>

            {type !== 'reminder' && (
              <div className="form-grid-2">
                <label className="field compact">
                  <span>Prioridade</span>
                  <select className="select" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </label>
                <label className="field compact">
                  <span>Categoria</span>
                  <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="">Sem categoria</option>
                    {categories.rows.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
              </div>
            )}

            <button className="btn planner-submit" disabled={saving} type="submit"><Plus size={18} /> {saving ? 'Salvando...' : 'Adicionar no dia'}</button>
          </form>

          <div className="card planner-list-card">
            <div className="planner-list-header">
              <div>
                <h2>Itens do dia</h2>
                <p className="muted">{selectedItems.length} registro(s)</p>
              </div>
            </div>
            <input className="input" placeholder="Buscar no dia selecionado" value={search} onChange={(e) => setSearch(e.target.value)} />

            <div className="planner-items">
              {selectedItems.length === 0 && <div className="empty-day">Nenhum item para este dia.</div>}
              {selectedItems.map((item) => (
                <div className="planner-item" key={`${item.type}-${item.id}`}>
                  <div className={`item-icon ${item.type}`}>{item.type === 'event' ? <CalendarCheck size={16} /> : item.type === 'task' ? <CheckSquare size={16} /> : <Bell size={16} />}</div>
                  <div className="item-content">
                    <b>{item.title}</b>
                    <span>{item.time || 'Sem horário'} • {item.status}</span>
                  </div>
                  <button className="mini-action" type="button" onClick={() => completeItem(item)} title="Concluir / marcar lido"><CheckCircle2 size={16} /></button>
                  <button className="mini-action danger" type="button" onClick={() => removeItem(item)} title="Excluir"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
