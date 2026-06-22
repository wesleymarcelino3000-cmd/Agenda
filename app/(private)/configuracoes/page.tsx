
"use client";

import { Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ConfiguracoesPage() {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      setName(data?.name ?? "");
    }
    load();
  }, []);

  async function save() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;
    await supabase.from("profiles").update({ name }).eq("id", userId);
    alert("Configurações salvas.");
  }

  return (
    <section>
      <div className="page-top">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-description">Preferências da conta e aparência do sistema.</p>
        </div>
      </div>

      <div className="form-card">
        <div className="card-header"><h2 className="card-title"><span className="card-title-icon"><Settings /></span>Minha conta</h2></div>
        <div className="form-grid">
          <div className="field"><label>Nome</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" /></div>
          <div className="field"><label>Tema</label><select value={theme} onChange={(e) => setTheme(e.target.value)}><option value="light">Claro</option><option value="dark">Escuro</option></select></div>
        </div>
        <button className="primary-button" onClick={save} style={{ marginTop: 16 }}><Save size={18} /> Salvar configurações</button>
      </div>
    </section>
  );
}
