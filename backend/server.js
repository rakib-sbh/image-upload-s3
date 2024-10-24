const fs = require("fs");

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const app = express();

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const bucketName = process.env.MY_BUCKET;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ success: true, message: "Hello" });
});

app.get("/home", (req, res) => {
  res.json({ success: true, message: "Welcome to home route" });
});

app.post("/upload", upload.single("image"), async (req, res) => {
  console.log(req.file);
  const params = {
    Bucket: bucketName,
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  const command = new PutObjectCommand(params);

  try {
    const response = await s3.send(command);
    if (response.$metadata.httpStatusCode === 200) {
      return res.json({
        success: true,
        imageUrl: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${req.file.originalname}`,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to upload image" });
  }

  res.json({ response });
});

app.delete("/delete", async (req, res) => {
  const { imageUrl } = req.body;
  const key = imageUrl.split("/").pop();

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  const command = new DeleteObjectCommand(params);

  try {
    const response = await s3.send(command);

    if (response.$metadata.httpStatusCode === 204) {
      return res.json({ success: true, message: "File deleted successfully" });
    } else {
      return res.status(500).json({
        success: false,
        message: "File deletion failed",
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
