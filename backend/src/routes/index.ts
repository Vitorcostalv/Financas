import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { accountRoutes } from "../modules/accounts/account.routes";
import { categoryRoutes } from "../modules/categories/category.routes";
import { transactionRoutes } from "../modules/transactions/transaction.routes";
import { dashboardRoutes } from "../modules/dashboard/dashboard.routes";
import { goalRoutes } from "../modules/goals/goal.routes";
import { planRoutes } from "../modules/plans/plan.routes";
import { projecaoRoutes } from "../modules/projecao/projecao.routes";
import { configuracoesRoutes } from "../modules/configuracoes/configuracoes.routes";
import { authMiddleware } from "../middlewares/auth";

const routes = Router();

routes.use("/auth", authRoutes);

routes.use("/accounts", authMiddleware, accountRoutes);
routes.use("/contas", authMiddleware, accountRoutes);

routes.use("/categories", authMiddleware, categoryRoutes);
routes.use("/categorias", authMiddleware, categoryRoutes);

routes.use("/transactions", authMiddleware, transactionRoutes);
routes.use("/transacoes", authMiddleware, transactionRoutes);

routes.use("/plans", authMiddleware, planRoutes);
routes.use("/planos", authMiddleware, planRoutes);

routes.use("/projecao", authMiddleware, projecaoRoutes);
routes.use("/configuracoes", authMiddleware, configuracoesRoutes);

routes.use("/dashboard", authMiddleware, dashboardRoutes);
routes.use("/goals", authMiddleware, goalRoutes);

export { routes };
