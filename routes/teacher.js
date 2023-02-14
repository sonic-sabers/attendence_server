import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import pkg from "gridfs-stream";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { createError } from "../error.js";
import Teacher from "../models/Teacher.js";
import { verifyToken } from "../verifyToken.js";
const router = express.Router();
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
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: "teacher" });
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
        const filename = file.originalname;
        const fileInfo = {
          filename: text,
          bucketName: "teacher",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

router.post("/register", upload.single("files"), async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new Teacher({
      ...req.body,
      password: hash,
      img: text,
    });
    await newUser.save();

    res.status(200).send(newUser);
  } catch (error) {
    next(error);
  }
});

router.get("/image/:username", async (req, res) => {
  const user = await Teacher.findOne({ username: req.params.username });
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

router.get("/:username", async (req, res, next) => {
  try {
    const u = await Teacher.findOne({ username: req.params.username });
    res.status(200).json(u);
  } catch (error) {
    next(error);
  }
});
router.post("/login", upload.single(), async (req, res, next) => {
  try {
    const user = await Teacher.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = await bcrypt.compare(req.body.password, user.password);

    if (!isCorrect) return next(createError(400, "Wrong Password!"));

    const token = jwt.sign({ id: user._id }, process.env.JWT, {
      expiresIn: "24h",
    });
    const { password, ...others } = user._doc;

    res
      .cookie("access_token", token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
        secure: false,
      })
      .status(200)
      .json({ others, token });
  } catch (error) {
    next(error);
  }
});

export default router;
