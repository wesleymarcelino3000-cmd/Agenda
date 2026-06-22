import "../tema-calendario-fix.css";
import "../tarefas-categorias-status.css";
import Sidebar from "@/components/layout/Sidebar";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
