import mongoose from "mongoose";

const salesDataSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  date: Date
});

export default mongoose.model("salesData", salesDataSchema);
