
"use client";

import { Check, FileSpreadsheet, FileText, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TarefasPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("media");
  const [status, setStatus] = useState("todos");
  const [query, setQuery] = useState("");

  async function load() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    const { data } = await supabase.from("tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setTasks(data ?? []);
  }

  useEffect(() => { load(); }, []);

  async function createTask() {
    if (!title.trim()) return;
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    await supabase.from("tasks").insert({
      user_id: userId,
      title,
      priority,
      status: "pendente",
    });
    setTitle("");
    await load();
  }

  async function toggleTask(task: any) {
    await supabase.from("tasks").update({
      status: task.status === "concluida" ? "pendente" : "concluida",
    }).eq("id", task.id);
    await load();
  }

  async function removeTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    await load();
  }

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = status === "todos" || task.status === status;
      const matchesQuery = task.title?.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [tasks, status, query]);

  return (
    <section>
      <div className="page-top">
        <div>
          <h1 className="page-title">Tarefas</h1>
          <p className="page-description">Crie, acompanhe, conclua e filtre suas tarefas com visual mais limpo.</p>
        </div>
        <div className="top-actions">
          <button className="soft-button"><FileText size={18} /> PDF</button>
          <button className="soft-button"><FileSpreadsheet size={18} /> Excel</button>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: 22 }}>
        <div className="form-grid">
          <div className="field">
            <label>Nova tarefa</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: ligar para cliente" />
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
        <button className="primary-button" onClick={createTask} style={{ marginTop: 14 }}><Plus size={18} /> Criar tarefa</button>
      </div>

      <div className="form-card" style={{ marginBottom: 22 }}>
        <div className="form-grid">
          <div className="field">
            <label>Buscar</label>
            <div style={{ position: "relative" }}>
              <Search size={18} style={{ position: "absolute", left: 14, top: 16, color: "#64748b" }} />
              <input style={{ paddingLeft: 44 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar tarefa" />
            </div>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="atrasada">Atrasada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="card-header">
          <h2 className="card-title">Lista de tarefas</h2>
          <span style={{ color: "#64748b", fontWeight: 800 }}>{filtered.length} item(ns)</span>
        </div>

        <div className="item-list">
          {filtered.length === 0 ? (
            <div className="empty-state">Nenhuma tarefa encontrada.</div>
          ) : filtered.map((task) => (
            <div className={`list-item ${task.status === "concluida" ? "done" : ""}`} key={task.id}>
              <div className="list-left">
                <button className="icon-button" onClick={() => toggleTask(task)}>
                  {task.status === "concluida" ? <RotateCcw size={18} /> : <Check size={18} />}
                </button>
                <span>{task.title}</span>
              </div>
              <div className="form-row">
                <span style={{ color: "#64748b", fontWeight: 800 }}>{task.priority}</span>
                <button className="danger-button" onClick={() => removeTask(task.id)}><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
