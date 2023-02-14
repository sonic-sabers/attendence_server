import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    attendence: [
      {
        date: String,
        imageId: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
