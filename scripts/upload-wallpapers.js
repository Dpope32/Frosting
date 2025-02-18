import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
});

const uploadFile = async (filePath, key) => {
  try {
    const fileContent = fs.readFileSync(filePath);
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || 'frosting-bucket',
      Key: `wallpapers/${key}`,
      Body: fileContent,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    });

    await s3Client.send(command);
    console.log(`Successfully uploaded ${key}`);
  } catch (error) {
    console.error(`Error uploading ${key}:`, error);
  }
};

const uploadWallpapers = async () => {
  const wallpapersDir = path.join(process.cwd(), 'assets/wallpapers-optimized');
  const files = fs.readdirSync(wallpapersDir);

  for (const file of files) {
    if (file.endsWith('.jpg')) {
      await uploadFile(path.join(wallpapersDir, file), file);
    }
  }
};

uploadWallpapers().catch(console.error);
