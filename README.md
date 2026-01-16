# Financas

## Deploy no Render (SQLite com Persistent Disk)
- Crie um Persistent Disk e monte em `/var/data`.
- Configure `DATABASE_URL` como `file:/var/data/dev.db`.
- Configure `JWT_SECRET`, `JWT_EXPIRES_IN` e `PORT`.
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npm run start`
- Para migrations em producao: `npx prisma migrate deploy`
