const router = express.Router();
import express, { request } from "express";
import multer from "multer";
import { createError } from "../error.js";
import A from "../models/Attendence.js";
import Class from "../models/Class.js";
const upload = multer();
router.post("/register", upload.single(), async (req, res, next) => {
  try {
    const c = new Class({ ...req.body });
    await c.save();

    res.status(200).json(c);
  } catch (error) {
    next(error);
  }
});

router.post("/postdata", async (req, res, next) => {
  try {
    const aa = new A({
      data: req.body.data,
    });
    await aa.save();
    res.status(200).json("saved");
  } catch (error) {
    next(error);
  }
});

router.get("/attendence", async (req, res, next) => {
  try {
    const arr = await A.find({});
    console.log(arr.length);
    res.status(200).json(arr[arr.length - 1]);
  } catch (error) {
    next(error);
  }
});

export default router;
