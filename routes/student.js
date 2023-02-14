const router = express.Router();
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import pkg from "gridfs-stream";
import mongoose from "mongoose";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { createError } from "../error.js";
import Class from "../models/Class.js";
import Student from "../models/Student.js";
import { verifyToken } from "../verifyToken.js";
dotenv.config();

//generate random text for increased security protection
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const text = generateString(10);
function generateString(length) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

const { Grid } = pkg;
const url = process.env.MONGO_URL;
const conn = mongoose.createConnection(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;

conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "student" });
});

//create storage engine
var storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const fileInfo = {
          filename: text,
          bucketName: "student",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

router.post(
  "/register",
  upload.single("files"),
  verifyToken,
  async (req, res, next) => {
    try {
      const c = await Class.find({ name: req.body.class });
      if (c) {
        const u = new Student({ ...req.body, img: text });
        await u.save();
        res.status(200).json(u);
      } else return next(createError(404, "Class not found"));
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const u = await Student.findById(req.params.id);
    res.status(200).json(u);
  } catch (error) {
    next(error);
  }
});

router.get("/image/:id", verifyToken, async (req, res, next) => {
  const user = await Student.findById(req.params.id);
  if (user) {
    await gfs.find({ filename: user.img }).toArray((err, files) => {
      if (!files[0] || files.length === 0) {
        res.status(404).json({ err: "No files exists" });
      }
      if (
        files[0].contentType === "image/jpeg" ||
        files[0].contentType === "image/png"
      ) {
        //read output to browser
        const readstream = gfs.openDownloadStreamByName(user.img);
        readstream.pipe(res);
      } else {
        res.status(404).json({ err: "Not an image" });
      }
    });
  } else {
    res.status(404).json({ err: "User not found" });
  }
});

export default router;
