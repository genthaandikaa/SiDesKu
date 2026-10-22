import api from '@/shared/lib/axios';

export const dashboardApi = {
  getSurats: async (params?: Record<string, any>) => {
    const res = await api.get('/surats', { params });
    return res.data;
  },
  getWargas: async (params?: Record<string, any>) => {
    const res = await api.get('/warga', { params });
    return res.data;
  },
  getKasRt: async () => {
    const res = await api.get('/kas-rt');
    return res.data;
  },
  getApbdes: async () => {
    const res = await api.get('/apbdes/records');
    return res.data;
  },
};
