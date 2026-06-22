# Agenda Profissional

Sistema profissional de Agenda, Tarefas, Calendário e Lembretes criado com Next.js, React, TypeScript, Supabase e preparado para deploy na Vercel.

## Funcionalidades

- Login, cadastro, recuperação e redefinição de senha
- Rotas privadas com middleware
- Sessão persistente com Supabase
- Dashboard com cards e gráfico de produtividade
- Tarefas com lista, Kanban, busca, filtros, status e prioridades
- Calendário/eventos com criação, edição, conclusão e exclusão
- Lembretes com central e marcação como lido
- Categorias com CRUD
- Configurações de usuário, e-mail, senha e tema
- RLS no Supabase para cada usuário acessar apenas seus próprios dados

## Instalação

```bash
npm install
npm run dev
```

## Variáveis de ambiente

Crie `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jesflocosjhwumqyxqtz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XIwh4LgHEGklFBuX1faj0g_xUsY19O-
```

## Banco Supabase

Execute o SQL em `supabase/schema.sql` no Supabase SQL Editor.

Tabelas criadas:

- profiles
- tasks
- events
- reminders
- categories
- user_preferences

O SQL ativa RLS e cria policies de SELECT, INSERT, UPDATE e DELETE por usuário.

## Deploy na Vercel

1. Envie o projeto para o GitHub.
2. Importe o repositório na Vercel.
3. Configure as variáveis:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
4. Rode o deploy.

## Comandos

```bash
npm run dev
npm run build
npm run start
npm run type-check
```
