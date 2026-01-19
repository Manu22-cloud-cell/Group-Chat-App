const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

exports.uploadMedia = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileKey = `media/${uuidv4()}_${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    await s3.upload(params).promise();

    console.log("S3 upload success:", fileKey);

    // MANUALLY CONSTRUCT URL
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    res.status(200).json({
      url: fileUrl,
      type: file.mimetype.startsWith("image")
        ? "image"
        : file.mimetype.startsWith("video")
        ? "video"
        : "file"
    });

  } catch (err) {
    console.error("S3 upload failed:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};
