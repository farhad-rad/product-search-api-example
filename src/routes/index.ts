import { Router } from "express";
import productRouter from "./productRouter";

const router = Router();

router.use("/products", productRouter);

router.all("*", (_, res) => {
  res.status(404).json({ error: "Not found" });
});

export default router;
