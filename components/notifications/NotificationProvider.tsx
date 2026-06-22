"use client";

import { Bell, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Reminder = {
  id: string;
  title: string;
  reminder_datetime: string;
  is_read?: boolean;
};

function canUseNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export default function NotificationProvider() {
  const [showPermission, setShowPermission] = useState(false);
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!canUseNotifications()) return;

    const saved = localStorage.getItem("agenda-notifications-enabled");

    if (saved !== "true" && Notification.permission === "default") {
      const timer = setTimeout(() => setShowPermission(true), 1600);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(checkReminders, 60000);
    checkReminders();

    return () => clearInterval(interval);
  }, []);

  async function askPermission() {
    if (!canUseNotifications()) return;

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      localStorage.setItem("agenda-notifications-enabled", "true");
      notifyBrowser("Agenda Pro", "Notificações ativadas com sucesso.");
    }

    setShowPermission(false);
  }

  function notifyBrowser(title: string, body: string) {
    if (!canUseNotifications()) return;
    if (Notification.permission !== "granted") return;

    new Notification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: `agenda-${title}-${body}`,
    });
  }

  async function checkReminders() {
    if (!canUseNotifications()) return;
    if (Notification.permission !== "granted") return;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return;

    const now = new Date();
    const from = new Date(now.getTime() - 60 * 1000).toISOString();
    const to = new Date(now.getTime() + 2 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("reminders")
      .select("id,title,reminder_datetime,is_read")
      .eq("user_id", userId)
      .eq("is_read", false)
      .gte("reminder_datetime", from)
      .lte("reminder_datetime", to)
      .limit(10);

    const reminders = (data ?? []) as Reminder[];

    for (const reminder of reminders) {
      if (notifiedIds.current.has(reminder.id)) continue;

      notifiedIds.current.add(reminder.id);

      notifyBrowser(
        "🔔 Agenda Pro",
        `${reminder.title} - ${new Date(reminder.reminder_datetime).toLocaleString("pt-BR")}`
      );

      await supabase
        .from("reminders")
        .update({ is_read: true })
        .eq("id", reminder.id);
    }
  }

  if (!showPermission) return null;

  return (
    <div className="notification-permission-card">
      <button
        className="notification-close"
        onClick={() => setShowPermission(false)}
        aria-label="Fechar"
      >
        <X size={16} />
      </button>

      <div className="notification-icon">
        <Bell size={22} />
      </div>

      <div>
        <strong>Ativar lembretes?</strong>
        <p>Permita notificações para receber alertas do Agenda Pro.</p>
      </div>

      <button className="notification-enable" onClick={askPermission}>
        Ativar
      </button>
    </div>
  );
}
