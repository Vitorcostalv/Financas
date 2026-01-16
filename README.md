# Financas

## Deploy no Render (SQLite com Persistent Disk)
- Crie um Persistent Disk e monte em `/var/data`.
- Configure `DATABASE_URL` como `file:/var/data/dev.db`.
- Configure `JWT_SECRET`, `JWT_EXPIRES_IN` e `PORT`.
- Build Command: `npm install && npx prisma generate && npm run build`
- Start Command: `npm run start`
- Para migrations em producao: `npx prisma migrate deploy`

## Testes manuais (curl)
```bash
# Login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"123456"}'

# Criar categoria (usa INCOME/EXPENSE ou Receita/Despesa)
curl -X POST http://localhost:3333/categorias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"name":"Salario","type":"Receita","color":"#00FF00"}'

# Projecao mensal
curl "http://localhost:3333/projecao/mensal?startMonth=1&startYear=2026&months=6" \
  -H "Authorization: Bearer SEU_TOKEN"
```
