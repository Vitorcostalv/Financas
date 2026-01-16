import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { accountRoutes } from "../modules/accounts/account.routes";
import { categoryRoutes } from "../modules/categories/category.routes";
import { transactionRoutes } from "../modules/transactions/transaction.routes";
import { dashboardRoutes } from "../modules/dashboard/dashboard.routes";
import { goalRoutes } from "../modules/goals/goal.routes";
import { planRoutes } from "../modules/plans/plan.routes";
import { authMiddleware } from "../middlewares/auth";

const routes = Router();

routes.use("/auth", authRoutes);

routes.use(authMiddleware);

routes.use("/accounts", accountRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/transactions", transactionRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/goals", goalRoutes);
routes.use("/plans", planRoutes);

export { routes };
