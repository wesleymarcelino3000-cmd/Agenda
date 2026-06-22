
"use client";

import { Bell, Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LembretesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { data } = await supabase.from("reminders").select("*").eq("user_id", userId).order("reminder_datetime", { ascending: true });
    setItems(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function createItem() {
    if (!title.trim() || !datetime) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    await supabase.from("reminders").insert({
      user_id: userId,
      title,
      reminder_datetime: datetime,
      type: "personalizado",
      is_read: false,
    });
    setTitle("");
    setDatetime("");
    await load();
  }

  async function markRead(id: string) {
    await supabase.from("reminders").update({ is_read: true }).eq("id", id);
    await load();
  }

  async function remove(id: string) {
    await supabase.from("reminders").delete().eq("id", id);
    await load();
  }

  return (
    <section>
      <div className="page-top">
        <div>
          <h1 className="page-title">Lembretes</h1>
          <p className="page-description">Central de notificações e lembretes importantes.</p>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 22 }}>
        <div className="form-grid">
          <div className="field"><label>Título</label><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: ligar para fornecedor" /></div>
          <div className="field"><label>Data e hora</label><input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} /></div>
        </div>
        <button className="primary-button" onClick={createItem} style={{ marginTop: 14 }}><Plus size={18} /> Criar lembrete</button>
      </div>

      <div className="panel-card">
        <div className="card-header"><h2 className="card-title"><span className="card-title-icon"><Bell /></span>Meus lembretes</h2></div>
        <div className="item-list">
          {items.length === 0 ? <div className="empty-state">Nenhum lembrete criado.</div> : items.map((item) => (
            <div className={`list-item ${item.is_read ? "done" : ""}`} key={item.id}>
              <div className="list-left"><Bell color="#7c3aed" /><span>{item.title}</span></div>
              <div className="form-row">
                <small>{new Date(item.reminder_datetime).toLocaleString("pt-BR")}</small>
                {!item.is_read && <button className="soft-button" onClick={() => markRead(item.id)}><Check size={18} /> Lido</button>}
                <button className="danger-button" onClick={() => remove(item.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
