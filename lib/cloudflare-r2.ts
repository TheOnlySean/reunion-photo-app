import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (getApps().length === 0) {
    const serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
    
    initializeApp({
      credential: cert(serviceAccountKey),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
    });
  }
};

export class FirebaseStorage {
  private static bucketName = process.env.FIREBASE_STORAGE_BUCKET!;

  static async uploadPhoto(
    sessionId: string, 
    photoIndex: number, 
    photoBuffer: Buffer, 
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    initializeFirebase();
    
    const fileName = `sessions/${sessionId}/photo-${photoIndex}-${Date.now()}.jpg`;
    const bucket = getStorage().bucket();
    const file = bucket.file(fileName);

    try {
      await file.save(photoBuffer, {
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000', // 1 year cache
          metadata: {
            sessionId,
            photoIndex: photoIndex.toString(),
            uploadedAt: new Date().toISOString(),
          }
        }
      });

      // Make file publicly accessible
      await file.makePublic();
      
      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading to Firebase Storage:', error);
      throw new Error('Failed to upload photo');
    }
  }

  static async uploadSelectedPhoto(
    sessionId: string, 
    photoBuffer: Buffer, 
    contentType: string = 'image/jpeg'
  ): Promise<string> {
    initializeFirebase();
    
    const fileName = `selected/${sessionId}/photo-${Date.now()}.jpg`;
    const bucket = getStorage().bucket();
    const file = bucket.file(fileName);

    try {
      await file.save(photoBuffer, {
        metadata: {
          contentType,
          cacheControl: 'public, max-age=31536000',
          metadata: {
            sessionId,
            isSelected: 'true',
            uploadedAt: new Date().toISOString(),
          }
        }
      });

      // Make file publicly accessible
      await file.makePublic();
      
      return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading selected photo to Firebase Storage:', error);
      throw new Error('Failed to upload selected photo');
    }
  }

  static async getSignedDownloadUrl(photoUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
      initializeFirebase();
      
      // Extract the filename from the public URL
      const url = new URL(photoUrl);
      const fileName = url.pathname.split('/').pop()!;
      
      const bucket = getStorage().bucket();
      const file = bucket.file(fileName);
      
      // Generate signed URL for download
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + (expiresIn * 1000),
      });
      
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  static getPublicUrl(fileName: string): string {
    return `https://storage.googleapis.com/${this.bucketName}/${fileName}`;
  }
}