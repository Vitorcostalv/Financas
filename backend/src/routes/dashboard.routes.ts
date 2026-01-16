import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { asyncHandler } from "../utils/asyncHandler";

const dashboardRoutes = Router();

dashboardRoutes.get(
  "/summary",
  asyncHandler(DashboardController.summary)
);

dashboardRoutes.get(
  "/expenses-by-category",
  asyncHandler(DashboardController.expensesByCategory)
);

dashboardRoutes.get(
  "/daily-flow",
  asyncHandler(DashboardController.dailyFlow)
);

export { dashboardRoutes };
