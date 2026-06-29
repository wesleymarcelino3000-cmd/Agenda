import "../tema-calendario-fix.css";
import "../tarefas-categoria-prioridade.css";
import "../notifications.css";
import Sidebar from "@/components/layout/Sidebar";
import NotificationProvider from "@/components/notifications/NotificationProvider";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
      <NotificationProvider />
    </div>
  );
}
