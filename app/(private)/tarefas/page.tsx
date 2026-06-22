"use client";

import {
  Check,
  FileSpreadsheet,
  FileText,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Tag,
  CircleDot,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Task = {
  id: string;
  title: string;
  priority: string | null;
  status: string | null;
  category_id?: string | null;
  due_date?: string | null;
  created_at?: string;
};

const statusOptions = [
  { value: "pendente", label: "Pendente", color: "#f59e0b", bg: "#fff7ed" },
  { value: "em_andamento", label: "Em andamento", color: "#2563eb", bg: "#eff6ff" },
  { value: "concluida", label: "Concluída", color: "#16a34a", bg: "#f0fdf4" },
  { value: "atrasada", label: "Atrasada", color: "#ef4444", bg: "#fef2f2" },
  { value: "cancelada", label: "Cancelada", color: "#64748b", bg: "#f8fafc" },
];

function getStatusConfig(status?: string | null) {
  return statusOptions.find((item) => item.value === status) ?? statusOptions[0];
}

function priorityLabel(priority?: string | null) {
  const value = priority || "media";

  const map: Record<string, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
    urgente: "Urgente",
  };

  return map[value] ?? value;
}

export default function TarefasPage() {
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("media");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("todos");
  const [query, setQuery] = useState(searchParams.get("busca") ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return;

    const [{ data: taskData }, { data: categoryData }] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),

      supabase
        .from("categories")
        .select("id,name,color")
        .eq("user_id", userId)
        .order("name", { ascending: true }),
    ]);

    setTasks(taskData ?? []);
    setCategories(categoryData ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createTask() {
    setMessage("");

    if (!title.trim()) {
      setMessage("Digite o nome da tarefa.");
      return;
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      setLoading(false);
      setMessage("Sessão não encontrada. Faça login novamente.");
      return;
    }

    const payload: Record<string, any> = {
      user_id: userId,
      title,
      priority,
      status: "pendente",
    };

    if (categoryId) {
      payload.category_id = categoryId;
    }

    const { error } = await supabase.from("tasks").insert(payload);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setTitle("");
    setPriority("media");
    setCategoryId("");
    setMessage("Tarefa criada com sucesso.");
    await loadData();

    setTimeout(() => setMessage(""), 2500);
  }

  async function updateTaskStatus(taskId: string, newStatus: string) {
    await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    await loadData();
  }

  async function toggleTask(task: Task) {
    await updateTaskStatus(
      task.id,
      task.status === "concluida" ? "pendente" : "concluida"
    );
  }

  async function removeTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    await loadData();
  }

  function getCategory(categoryId?: string | null) {
    return categories.find((category) => category.id === categoryId);
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
          <p className="page-description">
            Crie, acompanhe, conclua e filtre suas tarefas com categoria, cor e status.
          </p>
        </div>

        <div className="top-actions">
          <button className="soft-button">
            <FileText size={18} /> PDF
          </button>
          <button className="soft-button">
            <FileSpreadsheet size={18} /> Excel
          </button>
        </div>
      </div>

      <div className="form-card tasks-form-card" style={{ marginBottom: 22 }}>
        <div className="tasks-create-grid">
          <div className="field">
            <label>Nova tarefa</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: ligar para cliente"
            />
          </div>

          <div className="field">
            <label>Prioridade</label>
            <select value={priority} onChange={(event) => setPriority(event.target.value)}>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div className="field">
            <label>Categoria</label>
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  ● {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="primary-button" onClick={createTask} disabled={loading} style={{ marginTop: 14 }}>
          <Plus size={18} /> {loading ? "Criando..." : "Criar tarefa"}
        </button>

        {message && <div className="task-message">{message}</div>}
      </div>

      <div className="form-card" style={{ marginBottom: 22 }}>
        <div className="tasks-filter-grid">
          <div className="field">
            <label>Buscar</label>
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                style={{
                  position: "absolute",
                  left: 14,
                  top: 16,
                  color: "#64748b",
                }}
              />
              <input
                style={{ paddingLeft: 44 }}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar tarefa"
              />
            </div>
          </div>

          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="todos">Todos os status</option>
              {statusOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="card-header">
          <h2 className="card-title">Lista de tarefas</h2>
          <span style={{ color: "#64748b", fontWeight: 800 }}>
            {filtered.length} item(ns)
          </span>
        </div>

        <div className="item-list">
          {filtered.length === 0 ? (
            <div className="empty-state">Nenhuma tarefa encontrada.</div>
          ) : (
            filtered.map((task) => {
              const category = getCategory(task.category_id);
              const statusConfig = getStatusConfig(task.status);

              return (
                <div
                  className={`list-item task-row ${task.status === "concluida" ? "done" : ""}`}
                  key={task.id}
                >
                  <div className="task-main">
                    <button className="task-check-button" onClick={() => toggleTask(task)}>
                      {task.status === "concluida" ? (
                        <RotateCcw size={18} />
                      ) : (
                        <Check size={18} />
                      )}
                    </button>

                    <div className="task-info">
                      <span className="task-title">{task.title}</span>

                      <div className="task-meta">
                        {category ? (
                          <span className="task-category">
                            <span
                              className="category-dot"
                              style={{ background: category.color || "#2563eb" }}
                            />
                            {category.name}
                          </span>
                        ) : (
                          <span className="task-category muted">
                            <Tag size={14} />
                            Sem categoria
                          </span>
                        )}

                        <span className="task-priority">
                          <CircleDot size={13} />
                          {priorityLabel(task.priority)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="task-actions">
                    <select
                      className="task-status-select"
                      value={task.status || "pendente"}
                      onChange={(event) => updateTaskStatus(task.id, event.target.value)}
                      style={{
                        borderColor: statusConfig.color,
                        color: statusConfig.color,
                        background: statusConfig.bg,
                      }}
                    >
                      {statusOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>

                    <button className="danger-button" onClick={() => removeTask(task.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
