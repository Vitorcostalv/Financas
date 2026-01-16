import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { accountRoutes } from "./account.routes";
import { categoryRoutes } from "./category.routes";
import { transactionRoutes } from "./transaction.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { goalRoutes } from "./goal.routes";
import { authMiddleware } from "../middlewares/auth";

const routes = Router();

routes.use("/auth", authRoutes);

routes.use(authMiddleware);

routes.use("/accounts", accountRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/transactions", transactionRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/goals", goalRoutes);

export { routes };
