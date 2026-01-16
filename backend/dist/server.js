"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
app_1.app.listen(env_1.env.PORT, () => {
    const dbUrl = env_1.env.DATABASE_URL;
    const dbPath = dbUrl.startsWith("file:") ? dbUrl.slice(5) : dbUrl;
    console.log(`Banco: ${dbPath}`);
    console.log(`Finance API running on port ${env_1.env.PORT}`);
    console.log("Rotas registradas: /auth, /contas, /categorias, /transacoes, /planos, /projecao, /dashboard");
});
