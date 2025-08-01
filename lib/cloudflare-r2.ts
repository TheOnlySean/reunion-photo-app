import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ENDPOINT = `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export class CloudflareR2 {
  private static bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
  private static publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

  static async uploadPhoto(
    sessionId: string, 
    photoIndex: number, 
    photoBuffer: Buffer, 
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    const fileName = `sessions/${sessionId}/photo-${photoIndex}-${Date.now()}.jpg`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: photoBuffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
      Metadata: {
        sessionId,
        photoIndex: photoIndex.toString(),
        uploadedAt: new Date().toISOString(),
      }
    });

    try {
      await r2Client.send(command);
      return `${this.publicUrl}/${fileName}`;
    } catch (error) {
      console.error('Error uploading to R2:', error);
      throw new Error('Failed to upload photo');
    }
  }

  static async uploadSelectedPhoto(
    sessionId: string, 
    photoBuffer: Buffer, 
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    const fileName = `selected/${sessionId}/photo-${Date.now()}.jpg`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: photoBuffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
      Metadata: {
        sessionId,
        isSelected: 'true',
        uploadedAt: new Date().toISOString(),
      }
    });

    try {
      await r2Client.send(command);
      return `${this.publicUrl}/${fileName}`;
    } catch (error) {
      console.error('Error uploading selected photo to R2:', error);
      throw new Error('Failed to upload selected photo');
    }
  }

  static async getSignedDownloadUrl(photoUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Extract the key from the public URL
      const url = new URL(photoUrl);
      const key = url.pathname.substring(1); // Remove leading slash
      
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(r2Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  static getPublicUrl(fileName: string): string {
    return `${this.publicUrl}/${fileName}`;
  }
}