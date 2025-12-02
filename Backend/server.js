import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import csvRoutes from "./routes/csvRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use("/api/csv", csvRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
