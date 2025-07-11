import { logger } from './LoggingService';
import { ShortenedURL, ClickData, URLFormData, ValidationError } from '../types';

class URLService {
  private readonly MODULE_NAME = 'URLService';
  private readonly STORAGE_KEY = 'shortenedUrls';
  private readonly BASE_URL = 'http://localhost:3000';

  constructor() {
    logger.info('URLService initialized', {}, this.MODULE_NAME);
  }

  private generateShortCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    logger.debug('Generated short code', { shortCode: result }, this.MODULE_NAME);
    return result;
  }

  private generateUniqueId(): string {
    return `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidShortCode(shortCode: string): boolean {
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(shortCode);
  }

  private isShortCodeUnique(shortCode: string, excludeId?: string): boolean {
    const urls = this.getAllUrls();
    return !urls.some(url => url.shortCode === shortCode && url.id !== excludeId);
  }

  validateUrlData(data: URLFormData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate URL
    if (!data.originalUrl.trim()) {
      errors.push({ field: 'originalUrl', message: 'URL is required' });
    } else if (!this.isValidUrl(data.originalUrl)) {
      errors.push({ field: 'originalUrl', message: 'Please enter a valid URL' });
    }

    // Validate validity minutes
    if (data.validityMinutes < 1 || data.validityMinutes > 43200) { // Max 30 days
      errors.push({ field: 'validityMinutes', message: 'Validity must be between 1 and 43200 minutes' });
    }

    // Validate custom short code if provided
    if (data.customShortCode.trim()) {
      if (!this.isValidShortCode(data.customShortCode)) {
        errors.push({ field: 'customShortCode', message: 'Short code must be 3-20 alphanumeric characters' });
      } else if (!this.isShortCodeUnique(data.customShortCode)) {
        errors.push({ field: 'customShortCode', message: 'This short code is already taken' });
      }
    }

    logger.info('URL validation completed', { errors: errors.length }, this.MODULE_NAME);
    return errors;
  }

  shortenUrl(data: URLFormData): ShortenedURL {
    logger.info('Shortening URL', { originalUrl: data.originalUrl }, this.MODULE_NAME);

    const errors = this.validateUrlData(data);
    if (errors.length > 0) {
      logger.error('URL validation failed', { errors }, this.MODULE_NAME);
      throw new Error(`Validation failed: ${errors.map(e => e.message).join(', ')}`);
    }

    const shortCode = data.customShortCode.trim() || this.generateShortCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + data.validityMinutes * 60000);

    const shortenedUrl: ShortenedURL = {
      id: this.generateUniqueId(),
      originalUrl: data.originalUrl,
      shortCode,
      shortUrl: `${this.BASE_URL}/${shortCode}`,
      customShortCode: data.customShortCode.trim() || undefined,
      validityMinutes: data.validityMinutes,
      createdAt: now,
      expiresAt,
      isActive: true,
      clickCount: 0,
      clicks: []
    };

    this.saveUrl(shortenedUrl);
    logger.info('URL shortened successfully', { 
      id: shortenedUrl.id, 
      shortCode: shortenedUrl.shortCode 
    }, this.MODULE_NAME);

    return shortenedUrl;
  }

  private saveUrl(url: ShortenedURL): void {
    const urls = this.getAllUrls();
    urls.push(url);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(urls));
    logger.debug('URL saved to storage', { id: url.id }, this.MODULE_NAME);
  }

  getAllUrls(): ShortenedURL[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const urls = JSON.parse(stored).map((url: any) => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiresAt: new Date(url.expiresAt),
        clicks: url.clicks.map((click: any) => ({
          ...click,
          timestamp: new Date(click.timestamp)
        }))
      }));

      logger.debug('Retrieved URLs from storage', { count: urls.length }, this.MODULE_NAME);
      return urls;
    } catch (error) {
      logger.error('Failed to retrieve URLs from storage', { error }, this.MODULE_NAME);
      return [];
    }
  }

  getUrlByShortCode(shortCode: string): ShortenedURL | null {
    const urls = this.getAllUrls();
    const url = urls.find(u => u.shortCode === shortCode);
    
    if (url) {
      logger.info('URL found by short code', { shortCode, id: url.id }, this.MODULE_NAME);
      
      // Check if URL is still active
      if (new Date() > url.expiresAt) {
        logger.warn('URL has expired', { shortCode, expiresAt: url.expiresAt }, this.MODULE_NAME);
        url.isActive = false;
        this.updateUrl(url);
        return null;
      }
      
      return url;
    }
    
    logger.warn('URL not found by short code', { shortCode }, this.MODULE_NAME);
    return null;
  }

  recordClick(shortCode: string, clickData: Partial<ClickData>): void {
    logger.info('Recording click', { shortCode }, this.MODULE_NAME);
    
    const urls = this.getAllUrls();
    const urlIndex = urls.findIndex(u => u.shortCode === shortCode);
    
    if (urlIndex === -1) {
      logger.error('URL not found for click recording', { shortCode }, this.MODULE_NAME);
      return;
    }

    const url = urls[urlIndex];
    
    // Check if URL is still active
    if (new Date() > url.expiresAt) {
      logger.warn('Attempted to click expired URL', { shortCode }, this.MODULE_NAME);
      return;
    }

    const click: ClickData = {
      id: `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      source: clickData.source || 'direct',
      location: clickData.location || 'Unknown',
      userAgent: clickData.userAgent || navigator.userAgent,
      ipAddress: clickData.ipAddress || 'Unknown'
    };

    url.clicks.push(click);
    url.clickCount++;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(urls));
    logger.info('Click recorded successfully', { 
      shortCode, 
      clickCount: url.clickCount 
    }, this.MODULE_NAME);
  }

  private updateUrl(url: ShortenedURL): void {
    const urls = this.getAllUrls();
    const index = urls.findIndex(u => u.id === url.id);
    if (index !== -1) {
      urls[index] = url;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(urls));
      logger.debug('URL updated in storage', { id: url.id }, this.MODULE_NAME);
    }
  }

  getActiveUrls(): ShortenedURL[] {
    const urls = this.getAllUrls();
    const now = new Date();
    return urls.filter(url => url.isActive && now <= url.expiresAt);
  }

  getExpiredUrls(): ShortenedURL[] {
    const urls = this.getAllUrls();
    const now = new Date();
    return urls.filter(url => !url.isActive || now > url.expiresAt);
  }

  getTotalClicks(): number {
    const urls = this.getAllUrls();
    return urls.reduce((total, url) => total + url.clickCount, 0);
  }

  clearAllUrls(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    logger.info('All URLs cleared from storage', {}, this.MODULE_NAME);
  }
}

export const urlService = new URLService();