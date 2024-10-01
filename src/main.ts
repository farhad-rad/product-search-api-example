import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import router from "./routes";
import { ensureApiResult } from "./middlewares/ensureApiResult";
import { apiMessageHolder } from "./middlewares/apiMessageHolder";

dotenv.config({ override: false });
const app = express();

app.use(bodyParser.json());
app.use(apiMessageHolder);
app.use(ensureApiResult);

app.use(router);

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
