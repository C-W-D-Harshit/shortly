import dotenv from "dotenv";
// Setup environment variables as early as possible
dotenv.config();

import app from "./app";
import { prisma } from "./utils/prisma";
import os from "os";
import cluster from "cluster";

const PORT = process.env.PORT || 3000;
// Handling Uncaught Exceptions
process.on("uncaughtException", (err: Error) => {
  console.error(`Error: ${err.message}`, err.stack);
  console.error("Shutting down due to an uncaught exception");
  process.exit(1);
});

if (process.env.NODE_ENV === "production" && cluster.isPrimary) {
  const cCPUs = os.cpus().length;
  // Create a worker for each CPU
  for (let i = 0; i < cCPUs; i++) {
    cluster.fork();
  }
  cluster.on("online", (worker) => {
    console.log(`Worker ${worker.process.pid} is online.`);
  });
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const server = app.listen(PORT, () => {
    console.log(
      `Server is running on http://localhost:${PORT} and process id: ${process.pid}`
    );
  });

  const gracefulShutdown = async (signal?: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      console.log("HTTP server closed.");

      try {
        await prisma.$disconnect();
        console.log("Database connection closed.");
        process.exit(0);
      } catch (error) {
        console.error("Failed to close database connection:", error);
        process.exit(1);
      }
    });
  };

  // Handling Unhandled Promise Rejections
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("unhandledRejection");
  });

  // Listen for termination signals to gracefully shut down
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}
