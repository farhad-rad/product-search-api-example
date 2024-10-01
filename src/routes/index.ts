import { Router } from "express";
import productRouter from "./productRouter";

const router = Router();

router.use("/products", productRouter);

router.all("*", (_, res) => {
  res.apiResult(null, [], 404);
});

export default router;
