import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const dashboardRoutes = Router();

dashboardRoutes.get(
  "/summary",
  asyncHandler(DashboardController.summary)
);

dashboardRoutes.get(
  "/resumo",
  asyncHandler(DashboardController.summary)
);

dashboardRoutes.get(
  "/expenses-by-category",
  asyncHandler(DashboardController.expensesByCategory)
);

dashboardRoutes.get(
  "/despesas-por-categoria",
  asyncHandler(DashboardController.expensesByCategory)
);

dashboardRoutes.get(
  "/daily-flow",
  asyncHandler(DashboardController.dailyFlow)
);

dashboardRoutes.get(
  "/fluxo-diario",
  asyncHandler(DashboardController.dailyFlow)
);

export { dashboardRoutes };


