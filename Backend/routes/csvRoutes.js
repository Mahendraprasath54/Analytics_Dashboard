import express from "express";
import multer from "multer";
import { uploadCSV } from "../controllers/csvController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadCSV);

export default router;
