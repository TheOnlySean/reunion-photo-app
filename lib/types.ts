export interface PhotoSession {
  id: string;
  created_at: string;
  expires_at: string;
  selected_photo_url: string | null;
  download_count: number;
  session_name: string;
}

export interface TempPhoto {
  id: string;
  session_id: string;
  photo_url: string;
  photo_order: number;
  created_at: string;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  blob: Blob;
  order: number;
}

export interface DeviceType {
  type: 'ios' | 'android' | 'desktop';
  isSupported: boolean;
  canAutoDownload: boolean;
}

export interface UploadResponse {
  success: boolean;
  photoUrl?: string;
  sessionId?: string;
  error?: string;
}