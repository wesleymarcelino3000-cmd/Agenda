
"use client";

import { Plus, Tags, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CategoriasPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2563eb");

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { data } = await supabase.from("categories").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setItems(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function createItem() {
    if (!name.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    await supabase.from("categories").insert({ user_id: userId, name, color });
    setName("");
    await load();
  }

  async function remove(id: string) {
    await supabase.from("categories").delete().eq("id", id);
    await load();
  }

  return (
    <section>
      <div className="page-top">
        <div>
          <h1 className="page-title">Categorias</h1>
          <p className="page-description">Organize eventos, tarefas e lembretes por cores.</p>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 22 }}>
        <div className="form-grid">
          <div className="field"><label>Nome</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Trabalho" /></div>
          <div className="field"><label>Cor</label><input type="color" value={color} onChange={(e) => setColor(e.target.value)} /></div>
        </div>
        <button className="primary-button" onClick={createItem} style={{ marginTop: 14 }}><Plus size={18} /> Criar categoria</button>
      </div>

      <div className="panel-card">
        <div className="card-header"><h2 className="card-title"><span className="card-title-icon"><Tags /></span>Minhas categorias</h2></div>
        <div className="item-list">
          {items.length === 0 ? <div className="empty-state">Nenhuma categoria criada.</div> : items.map((item) => (
            <div className="list-item" key={item.id}>
              <div className="list-left"><span style={{ width: 16, height: 16, borderRadius: 99, background: item.color }} /> <span>{item.name}</span></div>
              <button className="danger-button" onClick={() => remove(item.id)}><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
