import { InjectionToken } from '@angular/core';

export type AuthApiSource = 'backend' | 'mock';

export interface AuthApiConfig {
  backendUrl: string;
  mockUrl: string;
  source: AuthApiSource;
}

export const AUTH_API_CONFIG = new InjectionToken<AuthApiConfig>(
  'AUTH_API_CONFIG',
);
