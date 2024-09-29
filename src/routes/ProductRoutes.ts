import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { ActionResolver } from "../utils/ActionResolver";

// Base: /products
const router = Router();

router.get("/", ActionResolver.resolve(ProductController, "getProducts"));
router.post("/", ActionResolver.resolve(ProductController, "createProduct"));

export default router;
