'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Lock, Mail, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'cadastro' | 'recuperar' | 'redefinir';

export function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        location.href = '/dashboard';
      }

      if (mode === 'cadastro') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name }, emailRedirectTo: `${location.origin}/dashboard` },
        });
        if (error) throw error;
        setMsg('Cadastro criado. Verifique seu e-mail se a confirmação estiver ativa.');
      }

      if (mode === 'recuperar') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/redefinir-senha`,
        });
        if (error) throw error;
        setMsg('Enviamos o link de recuperação para seu e-mail.');
      }

      if (mode === 'redefinir') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMsg('Senha alterada com sucesso.');
        setTimeout(() => (location.href = '/login'), 1200);
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  }

  const title = {
    login: 'Entrar na Agenda',
    cadastro: 'Criar conta',
    recuperar: 'Recuperar senha',
    redefinir: 'Redefinir senha',
  }[mode];

  return (
    <main className="auth auth-premium">
      <div className="auth-bg-shape auth-bg-shape-one" />
      <div className="auth-bg-shape auth-bg-shape-two" />

      <form className="auth-card auth-card-premium" onSubmit={submit}>
        <div className="auth-header">
          <h1>{title}</h1>
          <p>Sistema profissional de tarefas, calendário e lembretes.</p>
        </div>

        {mode === 'cadastro' && (
          <div className="field auth-field">
            <label>Nome</label>
            <div className="input-wrap">
              <UserRound size={20} />
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Seu nome" />
            </div>
          </div>
        )}

        {mode !== 'redefinir' && (
          <div className="field auth-field">
            <label>E-mail</label>
            <div className="input-wrap">
              <Mail size={20} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seuemail@email.com" />
            </div>
          </div>
        )}

        {mode !== 'recuperar' && (
          <div className="field auth-field">
            <label>Senha</label>
            <div className="input-wrap">
              <Lock size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Digite sua senha"
              />
              <button className="icon-button" type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Mostrar senha">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
        )}

        <button className="btn auth-submit" disabled={loading}>
          <span>{loading ? 'Processando...' : mode === 'recuperar' ? 'Enviar link' : 'Continuar'}</span>
          {!loading && <ArrowRight size={21} />}
        </button>

        {msg && <p className="auth-message">{msg}</p>}

        <p className="auth-links">
          {mode !== 'login' && <Link href="/login">Voltar para login</Link>}
          {mode === 'login' && (
            <>
              <Link href="/cadastro">Criar conta</Link>
              <span>·</span>
              <Link href="/recuperar-senha">Esqueci minha senha</Link>
            </>
          )}
        </p>
      </form>
    </main>
  );
}
