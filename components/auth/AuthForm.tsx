'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Mode = 'login'|'cadastro'|'recuperar'|'redefinir';
export function AuthForm({ mode }: { mode: Mode }) {
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState(''); const [msg,setMsg]=useState(''); const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setLoading(true);setMsg('');try{
  if(mode==='login'){const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error; location.href='/dashboard';}
  if(mode==='cadastro'){const {error}=await supabase.auth.signUp({email,password,options:{data:{name},emailRedirectTo:`${location.origin}/dashboard`}}); if(error) throw error; setMsg('Cadastro criado. Verifique seu e-mail se a confirmação estiver ativa.');}
  if(mode==='recuperar'){const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}/redefinir-senha`}); if(error) throw error; setMsg('Enviamos o link de recuperação para seu e-mail.');}
  if(mode==='redefinir'){const {error}=await supabase.auth.updateUser({password}); if(error) throw error; setMsg('Senha alterada com sucesso.'); setTimeout(()=>location.href='/login',1200);}
 }catch(err){setMsg(err instanceof Error?err.message:'Erro ao processar solicitação.')}finally{setLoading(false)}}
 const title={login:'Entrar na Agenda',cadastro:'Criar conta',recuperar:'Recuperar senha',redefinir:'Redefinir senha'}[mode];
 return <main className="auth"><form className="auth-card" onSubmit={submit}><h1>{title}</h1><p className="muted">Sistema profissional de tarefas, calendário e lembretes.</p>{mode==='cadastro'&&<div className="field"><label>Nome</label><input className="input" value={name} onChange={e=>setName(e.target.value)} required /></div>}{mode!=='redefinir'&&<div className="field"><label>E-mail</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>}{mode!=='recuperar'&&<div className="field"><label>Senha</label><input className="input" type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required /></div>}<button className="btn" disabled={loading}>{loading?'Processando...':'Continuar'}</button>{msg&&<p className="muted">{msg}</p>}<p className="muted">{mode!=='login'&&<Link href="/login">Voltar para login</Link>}{mode==='login'&&<><Link href="/cadastro">Criar conta</Link> · <Link href="/recuperar-senha">Esqueci minha senha</Link></>}</p></form></main>
}
