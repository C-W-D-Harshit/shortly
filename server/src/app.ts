import express from "express";
import path from "path";
import urlRoutes from "./routes/urlRoutes";
import { redirectToLongUrl } from "./controllers/urlController";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

// API routes should come before the catch-all routes
app.use("/api", urlRoutes);

// Handle redirects for short URLs
app.get("/:shortId", redirectToLongUrl);

// Serve static files from the Vite build output directory
app.use(express.static(path.join(__dirname, "../../build/client")));

// Serve the Vite app for all other routes (SPA fallback)
app.get("*", (req, res, next) => {
  // Exclude API routes from the SPA fallback
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../../build/client/index.html"));
});

// Global error handling middleware
app.use(errorHandler);

export default app;
