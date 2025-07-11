import axios, { AxiosError } from 'axios';
import { AuthConfig, AuthResponse } from './types';

/**
 * Handles authentication with the test server
 */
export class AuthManager {
  private static readonly AUTH_ENDPOINT = 'http://20.244.56.144/evaluation-service/auth';
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Authenticates with the test server and retrieves access token
   */
  async authenticate(config: AuthConfig): Promise<string> {
    try {
      const response = await axios.post<AuthResponse>(AuthManager.AUTH_ENDPOINT, {
        email: config.email,
        name: config.name,
        rollNo: config.rollNo,
        accessCode: config.accessCode,
        clientID: config.clientID,
        clientSecret: config.clientSecret
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = response.data.expires_in;

      return this.accessToken;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`);
      }
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Checks if the token is expired
   */
  isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return Date.now() / 1000 >= this.tokenExpiry;
  }

  /**
   * Clears the stored token
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}