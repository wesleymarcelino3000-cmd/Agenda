Adiciona notificações grátis do navegador/PWA para lembretes.

Funciona quando o Agenda Pro estiver aberto ou instalado como PWA.
Para notificação com app totalmente fechado por servidor, precisa Web Push com VAPID/cron ou API externa.

Substitua/adicione os arquivos no projeto e rode:
git add .
git commit -m "Notificacoes gratis para lembretes"
git push origin main

Arquivos incluídos:
- components/notifications/NotificationProvider.tsx
- app/notifications.css
- app/(private)/layout.tsx
