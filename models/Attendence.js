import mongoose from "mongoose";

const aSchema = new mongoose.Schema(
  {
    data: Object,
  },
  { timestamps: true }
);

export default mongoose.model("A", aSchema);
