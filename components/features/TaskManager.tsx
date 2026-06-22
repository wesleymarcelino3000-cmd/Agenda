'use client';

import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, FileDown, FileSpreadsheet, LayoutGrid, ListTodo, Plus, Search, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
import type { Priority, Task, TaskStatus } from '@/types/database';
import { exportToExcel, exportToPDF } from '@/lib/export';

const statuses: TaskStatus[] = ['pendente', 'em_andamento', 'concluida', 'atrasada', 'cancelada'];
const priorities: Priority[] = ['baixa', 'media', 'alta', 'urgente'];

const statusLabels: Record<TaskStatus, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
  cancelada: 'Cancelada',
};

const priorityLabels: Record<Priority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export function TaskManager() {
  const { user } = useAuth();
  const api = useSupabaseTable<Task>('tasks');
  const [view, setView] = useState<'lista' | 'kanban'>('lista');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('media');

  const filtered = useMemo(
    () =>
      api.rows.filter(
        (task) =>
          (!q || `${task.title} ${task.description ?? ''}`.toLowerCase().includes(q.toLowerCase())) &&
          (!status || task.status === status),
      ),
    [api.rows, q, status],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user || !title.trim()) return;

    await api.create({
      user_id: user.id,
      title: title.trim(),
      priority,
      status: 'pendente',
    });

    setTitle('');
  }

  async function completeTask(task: Task) {
    await api.update(task.id, { status: task.status === 'concluida' ? 'pendente' : 'concluida' });
  }

  return (
    <div className="tasks-premium-page">
      <div className="tasks-header">
        <div>
          <span className="tasks-kicker">Produtividade</span>
          <h1>Tarefas</h1>
          <p>Lista, Kanban, filtros, busca, animações e ações salvas direto no Supabase.</p>
        </div>

        <div className="tasks-actions">
          <button className="btn task-action-btn" onClick={() => exportToPDF('Tarefas', filtered as unknown as Record<string, unknown>[])}>
            <FileDown size={18} /> PDF
          </button>
          <button className="btn task-action-btn" onClick={() => exportToExcel('Tarefas', filtered as unknown as Record<string, unknown>[])}>
            <FileSpreadsheet size={18} /> Excel
          </button>
          <button className="btn task-action-btn primary-outline" onClick={() => setView(view === 'lista' ? 'kanban' : 'lista')}>
            {view === 'lista' ? <LayoutGrid size={18} /> : <ListTodo size={18} />}
            {view === 'lista' ? 'Kanban' : 'Lista'}
          </button>
        </div>
      </div>

      <form className="task-create-card" onSubmit={submit}>
        <div className="task-input-group grow">
          <label>Nova tarefa</label>
          <input className="task-input" placeholder="Ex: Reunião com fornecedor" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="task-input-group priority-box">
          <label>Prioridade</label>
          <select className="task-select" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {priorities.map((item) => (
              <option key={item} value={item}>
                {priorityLabels[item]}
              </option>
            ))}
          </select>
        </div>

        <button className="btn task-create-btn" type="submit">
          <Plus size={18} /> Criar
        </button>
      </form>

      <div className="task-filter-card">
        <div className="task-search-wrap">
          <Search size={18} />
          <input placeholder="Buscar tarefa" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        <select className="task-select status-select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos status</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {statusLabels[item]}
            </option>
          ))}
        </select>
      </div>

      {api.error && <p className="task-error">{api.error}</p>}
      {api.loading && <p className="task-empty">Carregando tarefas...</p>}

      {!api.loading && filtered.length === 0 && <p className="task-empty">Nenhuma tarefa encontrada.</p>}

      {!api.loading && filtered.length > 0 && view === 'lista' && (
        <div className="task-list">
          {filtered.map((task) => {
            const isDone = task.status === 'concluida';

            return (
              <article className={`task-row ${isDone ? 'done' : ''}`} key={task.id}>
                <button className={`task-check ${isDone ? 'checked' : ''}`} onClick={() => completeTask(task)} title="Concluir tarefa">
                  <CheckCircle2 size={22} />
                </button>

                <div className="task-row-content">
                  <strong>{task.title}</strong>
                  <span>{priorityLabels[task.priority]} prioridade</span>
                </div>

                <span className={`task-status ${task.status}`}>{statusLabels[task.status]}</span>

                <div className="task-row-actions">
                  <button className="btn task-small-btn success" onClick={() => completeTask(task)}>
                    {isDone ? 'Reabrir' : 'Concluir'}
                  </button>
                  <button className="btn task-small-btn danger" onClick={() => api.remove(task.id)}>
                    <Trash2 size={16} /> Excluir
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!api.loading && filtered.length > 0 && view === 'kanban' && (
        <div className="task-kanban">
          {statuses.map((columnStatus) => (
            <section className="task-column" key={columnStatus}>
              <header>
                <strong>{statusLabels[columnStatus]}</strong>
                <span>{filtered.filter((task) => task.status === columnStatus).length}</span>
              </header>

              {filtered
                .filter((task) => task.status === columnStatus)
                .map((task) => (
                  <article className={`task-kanban-card ${task.status === 'concluida' ? 'done' : ''}`} key={task.id}>
                    <strong>{task.title}</strong>
                    <span>{priorityLabels[task.priority]}</span>
                    <select className="task-select" value={task.status} onChange={(e) => api.update(task.id, { status: e.target.value })}>
                      {statuses.map((item) => (
                        <option key={item} value={item}>
                          {statusLabels[item]}
                        </option>
                      ))}
                    </select>
                  </article>
                ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
