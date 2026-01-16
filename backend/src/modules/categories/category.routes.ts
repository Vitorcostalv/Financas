import { Router } from "express";
import { CategoryController } from "./category.controller";
import { validate } from "../../middlewares/validate";
import {
  createCategorySchema,
  deleteCategorySchema,
  updateCategorySchema
} from "./category.schema";
import { asyncHandler } from "../../utils/asyncHandler";

const categoryRoutes = Router();

categoryRoutes.post(
  "/",
  validate(createCategorySchema),
  asyncHandler(CategoryController.create)
);

categoryRoutes.get("/", asyncHandler(CategoryController.list));

categoryRoutes.put(
  "/:id",
  validate(updateCategorySchema),
  asyncHandler(CategoryController.update)
);

categoryRoutes.delete(
  "/:id",
  validate(deleteCategorySchema),
  asyncHandler(CategoryController.delete)
);

export { categoryRoutes };


