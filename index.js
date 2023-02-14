import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import classRoutes from "./routes/class.js";
import studentRoutes from "./routes/student.js";
import teacherRoutes from "./routes/teacher.js";

var upload = multer();
dotenv.config();
const app = express();
mongoose.set("strictQuery", false);
const connect = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      throw err;
    });
};

//middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//custom error handling
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message: message,
  });
});

app.use("/api/teacher", teacherRoutes);
app.use("/api/class", classRoutes);
app.use("/api/student", studentRoutes);

app.listen(process.env.PORT || 9000, () => {
  console.log("Server started");
  connect();
});
