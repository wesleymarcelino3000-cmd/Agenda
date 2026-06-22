
"use client";

import { Bell, CalendarDays, ChevronLeft, ChevronRight, CheckSquare, Clock3, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ItemType = "evento" | "tarefa" | "lembrete";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sameDate(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const d = new Date(start);
    d.setDate(start.getDate() + index);
    return d;
  });
}

export default function CalendarioPage() {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [type, setType] = useState<ItemType>("evento");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("09:00");
  const [priority, setPriority] = useState("media");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => getCalendarDays(current.getFullYear(), current.getMonth()), [current]);

  async function loadItems() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const [tasks, events, reminders] = await Promise.all([
      supabase.from("tasks").select("*").eq("user_id", userId),
      supabase.from("events").select("*").eq("user_id", userId),
      supabase.from("reminders").select("*").eq("user_id", userId),
    ]);

    const merged = [
      ...(tasks.data ?? []).map((i) => ({ ...i, item_type: "tarefa", date: i.due_date })),
      ...(events.data ?? []).map((i) => ({ ...i, item_type: "evento", date: i.start_date })),
      ...(reminders.data ?? []).map((i) => ({ ...i, item_type: "lembrete", date: String(i.reminder_datetime).slice(0, 10) })),
    ];

    setItems(merged);
  }

  useEffect(() => { loadItems(); }, []);

  async function createItem() {
    if (!title.trim()) return alert("Digite um título.");

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    const date = toDateInput(selected);

    if (type === "evento") {
      await supabase.from("events").insert({
        user_id: userId,
        title,
        description,
        start_date: date,
        start_time: time,
        end_date: date,
        end_time: time,
        priority,
        status: "pendente",
      });
    }

    if (type === "tarefa") {
      await supabase.from("tasks").insert({
        user_id: userId,
        title,
        description,
        due_date: date,
        due_time: time,
        priority,
        status: "pendente",
      });
    }

    if (type === "lembrete") {
      await supabase.from("reminders").insert({
        user_id: userId,
        title,
        reminder_datetime: `${date}T${time}:00`,
        type: "personalizado",
        is_read: false,
      });
    }

    setTitle("");
    setDescription("");
    await loadItems();
    setLoading(false);
  }

  function nextMonth() {
    setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function prevMonth() {
    setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  const selectedKey = toDateInput(selected);
  const selectedItems = items.filter((i) => i.date === selectedKey);

  return (
    <section>
      <div className="page-top">
        <div>
          <p className="kicker">Agenda inteligente</p>
          <h1 className="page-title">Calendário</h1>
          <p className="page-description">Escolha um dia e crie eventos, tarefas ou lembretes com visual mensal profissional.</p>
        </div>
      </div>

      <div className="calendar-layout">
        <div className="content-card">
          <div className="calendar-toolbar">
            <div>
              <h2 className="calendar-title">{monthNames[current.getMonth()]} {current.getFullYear()}</h2>
              <p className="page-description" style={{ marginTop: 8 }}>Clique em um dia para organizar sua agenda.</p>
            </div>
            <div className="calendar-nav">
              <button className="icon-button" onClick={prevMonth}><ChevronLeft /></button>
              <button className="soft-button" onClick={() => { setCurrent(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today); }}>Hoje</button>
              <button className="icon-button" onClick={nextMonth}><ChevronRight /></button>
            </div>
          </div>

          <div className="calendar-grid">
            {weekDays.map((day) => <div key={day} className="calendar-weekday">{day}</div>)}
            {days.map((day) => {
              const key = toDateInput(day);
              const dayItems = items.filter((i) => i.date === key);
              const isCurrentMonth = day.getMonth() === current.getMonth();
              const isSelected = sameDate(day, selected);
              const isToday = sameDate(day, today);

              return (
                <button
                  key={key}
                  className={`calendar-day ${!isCurrentMonth ? "muted" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => setSelected(day)}
                >
                  <span className="day-number">{day.getDate()}</span>
                  <div className="day-dots">
                    {dayItems.slice(0, 5).map((item, idx) => (
                      <span
                        key={idx}
                        className="day-dot"
                        style={{ background: item.item_type === "evento" ? "#2563eb" : item.item_type === "tarefa" ? "#16a34a" : "#7c3aed" }}
                      />
                    ))}
                  </div>
                  {dayItems.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="day-chip">{item.title}</div>
                  ))}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="form-card">
          <h2 className="selected-day-title">{selected.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</h2>
          <p className="selected-day-sub">Novo agendamento para este dia.</p>

          <div className="segmented" style={{ marginBottom: 16 }}>
            <button className={type === "evento" ? "active" : ""} onClick={() => setType("evento")}><CalendarDays size={16} /> Evento</button>
            <button className={type === "tarefa" ? "active" : ""} onClick={() => setType("tarefa")}><CheckSquare size={16} /> Tarefa</button>
            <button className={type === "lembrete" ? "active" : ""} onClick={() => setType("lembrete")}><Bell size={16} /> Lembrete</button>
          </div>

          <div className="field">
            <label>Título</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Reunião com cliente" />
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label>Descrição</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do compromisso" />
          </div>

          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="field">
              <label>Horário</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="field">
              <label>Prioridade</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
          </div>

          <button className="primary-button" onClick={createItem} disabled={loading} style={{ width: "100%", marginTop: 18 }}>
            <Plus size={18} /> {loading ? "Salvando..." : "Criar agendamento"}
          </button>

          <div className="mini-events">
            <h3 style={{ margin: "8px 0 0" }}>Itens do dia</h3>
            {selectedItems.length === 0 ? (
              <div className="empty-state">Nenhum item criado para este dia.</div>
            ) : selectedItems.map((item, idx) => (
              <div key={idx} className="mini-event">
                <strong>{item.item_type === "evento" ? "📅" : item.item_type === "tarefa" ? "✅" : "🔔"} {item.title}</strong>
                <small>{item.description || item.reminder_datetime || "Sem descrição"}</small>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
