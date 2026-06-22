export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada' | 'cancelada';
export type Priority = 'baixa' | 'media' | 'alta' | 'urgente';
export type EventStatus = 'agendado' | 'concluido' | 'cancelado';
export type Theme = 'light' | 'dark';

export type Profile = { id: string; name: string | null; email: string | null; avatar_url: string | null; created_at: string };
export type Category = { id: string; user_id: string; name: string; color: string; created_at: string };
export type Task = { id: string; user_id: string; title: string; description: string | null; status: TaskStatus; priority: Priority; category_id: string | null; due_date: string | null; due_time: string | null; notes: string | null; created_at: string; updated_at: string };
export type EventItem = { id: string; user_id: string; title: string; description: string | null; start_date: string; start_time: string | null; end_date: string | null; end_time: string | null; category_id: string | null; priority: Priority; status: EventStatus; created_at: string; updated_at: string };
export type Reminder = { id: string; user_id: string; task_id: string | null; event_id: string | null; title: string; reminder_datetime: string; type: string; is_read: boolean; created_at: string };
export type UserPreferences = { id: string; user_id: string; theme: Theme; default_reminder: string; created_at: string; updated_at: string };
