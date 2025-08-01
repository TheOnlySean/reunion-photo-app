import { Pool } from 'pg';
import { PhotoSession, TempPhoto, DeviceAuth } from './types';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export class Database {
  static async createSession(sessionName: string = 'reunion-photo'): Promise<string> {
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const expirationHours = parseInt(process.env.PHOTO_EXPIRE_HOURS || '24');
    
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO photo_sessions (id, session_name, expires_at) 
         VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '${expirationHours} hours')`,
        [sessionId, sessionName]
      );
      return sessionId;
    } finally {
      client.release();
    }
  }

  static async getSession(sessionId: string): Promise<PhotoSession | null> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM photo_sessions WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP',
        [sessionId]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  static async saveTempPhotos(sessionId: string, photoUrls: string[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < photoUrls.length; i++) {
        const photoId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        await client.query(
          'INSERT INTO temp_photos (id, session_id, photo_url, photo_order) VALUES ($1, $2, $3, $4)',
          [photoId, sessionId, photoUrls[i], i + 1]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTempPhotos(sessionId: string): Promise<TempPhoto[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM temp_photos WHERE session_id = $1 ORDER BY photo_order',
        [sessionId]
      );
      return result.rows;
    } finally {
      client.release();
    }
  }

  static async selectPhoto(sessionId: string, photoUrl: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE photo_sessions SET selected_photo_url = $1 WHERE id = $2',
        [photoUrl, sessionId]
      );
    } finally {
      client.release();
    }
  }

  static async incrementDownloadCount(sessionId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query(
        'UPDATE photo_sessions SET download_count = download_count + 1 WHERE id = $1',
        [sessionId]
      );
    } finally {
      client.release();
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM photo_sessions WHERE expires_at < CURRENT_TIMESTAMP');
    } finally {
      client.release();
    }
  }

  // Device Authentication Methods
  static async authenticateDevice(deviceId: string, password: string): Promise<DeviceAuth | null> {
    const client = await pool.connect();
    try {
      // Hash the password for comparison (in production, use proper hashing)
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      const result = await client.query(
        `SELECT * FROM device_auth 
         WHERE device_id = $1 AND password = $2 AND is_active = true`,
        [deviceId, hashedPassword]
      );
      
      if (result.rows.length > 0) {
        // Update last login
        await client.query(
          'UPDATE device_auth SET last_login = CURRENT_TIMESTAMP WHERE device_id = $1',
          [deviceId]
        );
        return result.rows[0];
      }
      
      return null;
    } finally {
      client.release();
    }
  }

  static async createDeviceAuth(deviceId: string, password: string, deviceName: string): Promise<string> {
    const client = await pool.connect();
    try {
      const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      
      await client.query(
        `INSERT INTO device_auth (id, device_id, password, device_name, is_active) 
         VALUES ($1, $2, $3, $4, true)`,
        [id, deviceId, hashedPassword, deviceName]
      );
      
      return id;
    } finally {
      client.release();
    }
  }

  static async generateAuthToken(deviceId: string): Promise<string> {
    // Generate a simple JWT-like token (in production, use proper JWT)
    const payload = {
      deviceId,
      timestamp: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    return token;
  }

  static async verifyAuthToken(token: string): Promise<{ deviceId: string } | null> {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (payload.expires < Date.now()) {
        return null; // Token expired
      }
      
      return { deviceId: payload.deviceId };
    } catch {
      return null; // Invalid token
    }
  }
}