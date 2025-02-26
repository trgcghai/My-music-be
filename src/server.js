import express from "express";
import helmet from "helmet";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import "dotenv/config";

import songRoutes from "./routes/song.routes.js";
import pingRoutes from "./routes/ping.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import authRoutes from "./routes/auth/index.js";
import { connectToDatabase } from "./configs/dbConfig.js";

const app = express();
// eslint-disable-next-line no-undef
const port = process.env.PORT || 8000;

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
});

app.use(compression());
app.use(limiter);
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/api/v1", pingRoutes);
app.use("/api/v1/song", songRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/auth", authRoutes);

async function startServer() {
  try {
    // Kết nối database trước
    await connectToDatabase();

    // Sau đó mới start server
    app.listen(port, () => {
      console.log("Server running on port " + port);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

await startServer();
