export interface VerifyLicenseResult {
  valid: boolean;
  reason?: string;
  expiresAt?: string;
  expired?: boolean;
}

export function verifyLicenseKey(
  key: string,
  machineId: string,
  product: string,
  publicKeyPem: string
): VerifyLicenseResult;

export interface CheckLicenseOptions {
  serverUrl: string;
  product: string;
  machineId: string;
  publicKeyPem: string;
  cacheFile: string;
  apiKey?: string;
  storeName?: string;
  appVersion?: string;
  timeoutMs?: number;
}

export interface CheckLicenseResult {
  allowed: boolean;
  status: 'active' | 'expiring' | 'locked' | 'pending' | 'expired' | 'offline';
  machineId: string;
  reason?: string;
  expiresAt?: string;
  licenseKey?: string;
  offline?: boolean;
}

export function checkLicense(options: CheckLicenseOptions): Promise<CheckLicenseResult>;

export function verifyToken(token: string, publicKeyPem: string): any;
