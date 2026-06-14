import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler.middleware";

import "./models/mongo";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

import routes from "./routes";
app.use("/api/v1", routes);

app.use(errorHandler);

export { app };
