export interface ShortenedURL {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  customShortCode?: string;
  validityMinutes: number;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
  clickCount: number;
  clicks: ClickData[];
}

export interface ClickData {
  id: string;
  timestamp: Date;
  source: string;
  location: string;
  userAgent: string;
  ipAddress: string;
}

export interface URLFormData {
  originalUrl: string;
  validityMinutes: number;
  customShortCode: string;
}

export interface ValidationError {
  field: string;
  message: string;
}