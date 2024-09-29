import { Router } from "express";
import productRouter from "./ProductRoutes";

const router = Router();

router.use("/products", productRouter);

export default router;
