const router = express.Router();
import express, { request } from "express";
import multer from "multer";
import { createError } from "../error.js";
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

export default router;
