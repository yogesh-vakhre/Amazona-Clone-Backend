const { S3Client } = require("@aws-sdk/client-s3");
const { request } = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { processTitle } = require("../utils//generateTrackURL");
const { v4: uuidv4 } = require("uuid");
const {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  AWS_REGION,
  BUCKET_NAME,
} = require("../config/s3");

const configuration = {
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY,
  region: AWS_REGION,
};

const s3 = new S3Client({
  credentials: configuration,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      const id = uuidv4();
      let title;

      if (title) {
        title = `${id}-${file.fieldname}`;
      } else {
        title = processTitle(req.body.title);
      }

      const directoryPath = AWS_UPLOAD_PATH;
      const fileName = `${title}.${file.originalname.split(".").pop()}`;
      const filePath = `${directoryPath}${fileName}`;

      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype.includes("video")
      ) {
        cb(null, {
          fieldName: filePath,
        });
      } else {
        cb(null, {
          fieldName: filePath,
        });
      }
    },
    key: function (req, file, cb) {
      const id = uuidv4();
      let title;

      if (req.body.title) {
        title = `${id}-${file.fieldname}`;
      } else {
        title = processTitle(req.body.title);
      }

      const directoryPath = "uploads/";
      const fileName = `${title}.${file.originalname.split(".").pop()}`;
      const filePath = `${directoryPath}${fileName}`;

      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype.includes("video")
      ) {
        cb(null, filePath);
      } else {
        cb(null, filePath);
      }
    },
  }),
});

module.exports = upload;
