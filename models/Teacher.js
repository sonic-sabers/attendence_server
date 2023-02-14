import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    email: { type: String },
    classteacher: [{}],
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);
