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

# Projecao mensal (endpoint depreciado, use /planos/projecao-mensal)
curl "http://localhost:3333/projecao/mensal?startMonth=1&startYear=2026&months=6" \
  -H "Authorization: Bearer SEU_TOKEN"

# Projecao mensal via planejamento (oficial)
curl "http://localhost:3333/planos/projecao-mensal?startMonth=1&startYear=2026&months=6" \
  -H "Authorization: Bearer SEU_TOKEN"

# Criar conta (WALLET, EXTRA_POOL, EXPENSE_POOL, CREDIT_CARD)
curl -X POST http://localhost:3333/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"name":"Carteira","type":"WALLET","balanceCents":150000}'

# Criar cartao de credito
curl -X POST http://localhost:3333/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"name":"Cartao","type":"CREDIT_CARD","creditLimitCents":500000}'

# Criar transacao
curl -X POST http://localhost:3333/transacoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"description":"Mercado","amountCents":12000,"date":"2026-01-10","type":"EXPENSE","categoryId":"ID_CAT","accountId":"ID_CONTA"}'

# Criar plano (planejamento)
curl -X POST http://localhost:3333/planos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "title":"Viagem",
    "description":"Planejamento de viagem",
    "minBudgetCents":200000,
    "maxBudgetCents":400000,
    "items":[
      {
        "name":"Passagem",
        "description":"Compra da passagem",
        "amountCents":120000,
        "purchaseType":"ONE_TIME",
        "dueDate":"2026-02-10"
      }
    ]
  }'

# Atualizar perfil
curl -X PUT http://localhost:3333/configuracoes/perfil \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"name":"Novo Nome","email":"novo@email.com"}'

# Atualizar senha
curl -X PUT http://localhost:3333/configuracoes/senha \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"currentPassword":"123456","newPassword":"12345678"}'

# Criar conta variavel com vigencias
curl -X POST http://localhost:3333/contas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "name":"Salario",
    "type":"WALLET",
    "valueMode":"VARIABLE",
    "startDate":"2026-01-01",
    "schedules":[
      {
        "type":"INCOME",
        "amountCents":500000,
        "frequency":"MONTHLY",
        "startDate":"2026-01-01"
      }
    ]
  }'

# Criar vigencia para conta
curl -X POST http://localhost:3333/contas/ID_CONTA/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"type":"EXPENSE","amountCents":30000,"frequency":"MONTHLY","startDate":"2026-01-05"}'

# Serie mensal do dashboard
curl "http://localhost:3333/dashboard/serie-mensal?startMonth=1&startYear=2026&months=6" \
  -H "Authorization: Bearer SEU_TOKEN"
```
