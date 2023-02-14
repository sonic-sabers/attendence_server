import mongoose from "mongoose";
import { createError } from "../error.js";
import { verifyToken } from "../verifyToken.js";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    class: String,
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
