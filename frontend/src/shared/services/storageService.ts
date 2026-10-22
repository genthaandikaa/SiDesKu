export const storageService = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },
  removeToken: (): void => {
    localStorage.removeItem('token');
  },
  clear: (): void => {
    localStorage.clear();
  },
};
