"use client";

import "../login/login.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CadastroPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      setLoading(false);
      setMessage(error.message || "Não foi possível criar o usuário.");
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        name,
        email,
      });
    }

    setLoading(false);
    setSuccess(true);
    setMessage("Usuário criado com sucesso.");

    setTimeout(() => {
      router.replace("/login");
    }, 2000);
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
          <h1>Criar conta</h1>
          <p>Sistema profissional de tarefas, calendário e lembretes.</p>
        </header>

        {success ? (
          <div className="login-success-box">
            <CheckCircle2 size={44} />
            <h2>Usuário criado com sucesso</h2>
            <p>
              Sua conta foi criada com sucesso. Você já pode acessar o Agenda Pro
              utilizando seu e-mail e senha.
            </p>
            <Link href="/login" className="login-submit">
              Entrar agora
              <ArrowRight size={22} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="name">Nome</label>
              <div className="login-input">
                <User size={21} />
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
            </div>

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

            <div className="login-field">
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <div className="login-input">
                <Lock size={21} />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
            </div>

            {message && <div className="login-error">{message}</div>}

            <button className="login-submit" disabled={loading}>
              {loading ? "Criando usuário..." : "Criar conta"}
              <ArrowRight size={22} />
            </button>
          </form>
        )}

        {!success && (
          <div className="login-links">
            <Link href="/login">Voltar para login</Link>
          </div>
        )}
      </section>
    </main>
  );
}
