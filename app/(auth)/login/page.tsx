"use client";

import "./login.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("E-mail ou senha inválidos.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <img src="/logo-agenda-pro.png" alt="Agenda Pro" />
          <div>
            <strong>
              Agenda <span>Pro</span>
            </strong>
            <small>Organize • Planeje • Realize</small>
          </div>
        </div>

        <header className="login-header">
          <h1>Entrar na Agenda</h1>
          <p>Sistema profissional de tarefas, calendário e lembretes.</p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">E-mail</label>
            <div className="login-input">
              <Mail size={21} />
              <input
                id="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Senha</label>
            <div className="login-input">
              <Lock size={21} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Mostrar ou esconder senha"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {message && <div className="login-error">{message}</div>}

          <button className="login-submit" disabled={loading}>
            {loading ? "Entrando..." : "Continuar"}
            <ArrowRight size={22} />
          </button>
        </form>

        <div className="login-links">
          <Link href="/cadastro">Criar conta</Link>
          <span>•</span>
          <Link href="/recuperar-senha">Esqueci minha senha</Link>
        </div>
      </section>
    </main>
  );
}
