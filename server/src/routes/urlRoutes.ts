import { createURL } from "@/controllers/urlController";
import express from "express";

const router = express.Router();

router.post("/shorten", createURL);

export default router;
