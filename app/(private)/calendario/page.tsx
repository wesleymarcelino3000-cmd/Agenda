"use client";

import { Bell, CalendarDays, ChevronLeft, ChevronRight, CheckSquare, Clock, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type ItemType = "evento" | "tarefa" | "lembrete";
type CalendarItem = { id: string; item_type: ItemType; title: string; description?: string | null; date: string; time?: string | null; };

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDate(a: Date, b: Date) { return localDateKey(a) === localDateKey(b); }

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function itemColor(type: ItemType) {
  if (type === "evento") return "#2563eb";
  if (type === "tarefa") return "#16a34a";
  return "#7c3aed";
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
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const days = useMemo(() => getCalendarDays(current.getFullYear(), current.getMonth()), [current]);

  async function loadItems() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const [tasksResult, eventsResult, remindersResult] = await Promise.all([
      supabase.from("tasks").select("*").eq("user_id", userId),
      supabase.from("events").select("*").eq("user_id", userId),
      supabase.from("reminders").select("*").eq("user_id", userId),
    ]);

    const merged: CalendarItem[] = [
      ...(tasksResult.data ?? []).filter((item) => item.due_date).map((item) => ({ id: item.id, item_type: "tarefa" as ItemType, title: item.title, description: item.description, date: item.due_date, time: item.due_time })),
      ...(eventsResult.data ?? []).filter((item) => item.start_date).map((item) => ({ id: item.id, item_type: "evento" as ItemType, title: item.title, description: item.description, date: item.start_date, time: item.start_time })),
      ...(remindersResult.data ?? []).filter((item) => item.reminder_datetime).map((item) => ({ id: item.id, item_type: "lembrete" as ItemType, title: item.title, description: null, date: String(item.reminder_datetime).slice(0, 10), time: String(item.reminder_datetime).slice(11, 16) })),
    ];

    setItems(merged);
  }

  useEffect(() => { loadItems(); }, []);

  function previousMonth() { setCurrent((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1)); }
  function nextMonth() { setCurrent((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1)); }
  function goToday() { const now = new Date(); setCurrent(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(now); }

  async function createItem() {
    setError(""); setToast("");
    if (!title.trim()) { setError("Digite um título para criar o agendamento."); return; }

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) { setLoading(false); setError("Sessão não encontrada. Faça login novamente."); return; }

    const date = localDateKey(selected);
    let result;

    if (type === "evento") {
      result = await supabase.from("events").insert({ user_id: userId, title, description, start_date: date, start_time: time, end_date: date, end_time: time, priority, status: "pendente" });
    }
    if (type === "tarefa") {
      result = await supabase.from("tasks").insert({ user_id: userId, title, description, due_date: date, due_time: time, priority, status: "pendente" });
    }
    if (type === "lembrete") {
      result = await supabase.from("reminders").insert({ user_id: userId, title, reminder_datetime: `${date}T${time}:00`, type: "personalizado", is_read: false });
    }

    setLoading(false);

    if (result?.error) { setError(result.error.message); return; }

    setTitle(""); setDescription("");
    setToast("Agendamento criado com sucesso.");
    await loadItems();
    setTimeout(() => setToast(""), 3000);
  }

  const selectedKey = localDateKey(selected);
  const selectedItems = items.filter((item) => item.date === selectedKey);

  return (
    <section>
      <div className="page-top">
        <div>
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
              <button className="icon-button" onClick={previousMonth} aria-label="Mês anterior" type="button"><ChevronLeft /></button>
              <button className="soft-button" onClick={goToday} type="button">Hoje</button>
              <button className="icon-button" onClick={nextMonth} aria-label="Próximo mês" type="button"><ChevronRight /></button>
            </div>
          </div>

          <div className="calendar-grid">
            {weekDays.map((day) => <div key={day} className="calendar-weekday">{day}</div>)}
            {days.map((day) => {
              const key = localDateKey(day);
              const dayItems = items.filter((item) => item.date === key);
              const isCurrentMonth = day.getMonth() === current.getMonth();
              const isSelected = sameDate(day, selected);
              const isToday = sameDate(day, today);

              return (
                <button key={key} className={`calendar-day ${!isCurrentMonth ? "muted" : ""} ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`} onClick={() => setSelected(day)} type="button">
                  <span className="day-number">{day.getDate()}</span>
                  <div className="day-dots">
                    {dayItems.slice(0, 5).map((item) => <span key={`${item.item_type}-${item.id}`} className="day-dot" style={{ background: itemColor(item.item_type) }} />)}
                  </div>
                  {dayItems.slice(0, 2).map((item) => <div key={`${item.item_type}-${item.id}-chip`} className="day-chip" style={{ color: itemColor(item.item_type), background: `${itemColor(item.item_type)}18` }}>{item.title}</div>)}
                </button>
              );
            })}
          </div>
        </div>

        <aside className="form-card">
          <h2 className="selected-day-title">{selected.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</h2>
          <p className="selected-day-sub">Novo agendamento para este dia.</p>

          <div className="segmented" style={{ marginBottom: 16 }}>
            <button type="button" className={type === "evento" ? "active" : ""} onClick={() => setType("evento")}><CalendarDays size={16} /> Evento</button>
            <button type="button" className={type === "tarefa" ? "active" : ""} onClick={() => setType("tarefa")}><CheckSquare size={16} /> Tarefa</button>
            <button type="button" className={type === "lembrete" ? "active" : ""} onClick={() => setType("lembrete")}><Bell size={16} /> Lembrete</button>
          </div>

          <div className="field"><label>Título</label><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex: Reunião com cliente" /></div>
          <div className="field" style={{ marginTop: 12 }}><label>Descrição</label><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Detalhes do compromisso" /></div>

          <div className="form-grid" style={{ marginTop: 12 }}>
            <div className="field"><label>Horário</label><div style={{ position: "relative" }}><input type="time" value={time} onChange={(event) => setTime(event.target.value)} /><Clock size={18} style={{ position: "absolute", right: 14, top: 16, color: "#64748b", pointerEvents: "none" }} /></div></div>
            <div className="field"><label>Prioridade</label><select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="baixa">Baixa</option><option value="media">Média</option><option value="alta">Alta</option><option value="urgente">Urgente</option></select></div>
          </div>

          <button className="primary-button" onClick={createItem} disabled={loading} style={{ width: "100%", marginTop: 18 }} type="button"><Plus size={18} /> {loading ? "Salvando..." : "Criar agendamento"}</button>

          {toast && <div className="calendar-toast">{toast}</div>}
          {error && <div className="calendar-error">{error}</div>}

          <div className="mini-events">
            <h3 style={{ margin: "8px 0 0" }}>Itens do dia</h3>
            {selectedItems.length === 0 ? <div className="empty-state">Nenhum item criado para este dia.</div> : selectedItems.map((item) => (
              <div key={`${item.item_type}-${item.id}`} className="mini-event">
                <strong>{item.item_type === "evento" ? "📅" : item.item_type === "tarefa" ? "✅" : "🔔"} {item.title}</strong>
                <small>{item.time ? `${item.time} • ` : ""}{item.description || "Sem descrição"}</small>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
