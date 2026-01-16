import { app } from "./app";
import { env } from "./config/env";

app.listen(env.PORT, () => {
  const dbUrl = env.DATABASE_URL;
  const dbPath = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
  console.log(`Banco: ${dbPath}`);
  console.log(`Finance API running on port ${env.PORT}`);
  console.log(
    "Rotas registradas: /auth, /contas, /categorias, /transacoes, /planos, /projecao, /dashboard"
  );
});
