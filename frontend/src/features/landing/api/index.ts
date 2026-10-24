import api from '@/shared/lib/axios';
import { PublicHomeData } from '../types';

export const landingApi = {
  getHomeData: async (): Promise<PublicHomeData> => {
    const res = await api.get('/public/home');
    return res.data;
  },
  getBeritas: async () => {
    const res = await api.get('/public/beritas');
    return res.data;
  },
  getPengumumans: async () => {
    const res = await api.get('/public/pengumumans');
    return res.data;
  },
  getStats: async () => {
    const res = await api.get('/public/stats');
    return res.data;
  },
  trackSurat: async (identifier: string) => {
    const res = await api.get('/public/surat/track', { params: { identifier } });
    return res.data;
  },
  verifyQr: async (hash: string) => {
    const res = await api.get(`/public/surat/verify-qr/${hash}`);
    return res.data;
  },
};
