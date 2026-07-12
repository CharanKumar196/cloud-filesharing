const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload file to S3
const uploadFile = async (fileKey, fileBuffer, mimeType) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return { success: true, fileKey };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};

// Get signed download URL (expires in 1 hour)
const getDownloadUrl = async (fileKey) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error("S3 URL Error:", error);
    throw error;
  }
};

// Delete file from S3
const deleteFile = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw error;
  }
};

module.exports = { uploadFile, getDownloadUrl, deleteFile };