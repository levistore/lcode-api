import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import config from "./config/app.js";
import routes from "./routes/index.js";
import { requestLogger } from "./middlewares/logger.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger());

app.get("/", (_req, res) => {
  res.json({
    name: "Lcode API",
    version: "1.0.0",
    status: "running",
    docs: `${config.frontendUrl}/docs`,
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
