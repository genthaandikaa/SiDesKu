import { storageService } from '@/shared/services';

export const authService = {
  saveSession: (token: string): void => {
    storageService.setToken(token);
  },
  clearSession: (): void => {
    storageService.removeToken();
  },
  hasActiveSession: (): boolean => {
    return Boolean(storageService.getToken());
  },
};
