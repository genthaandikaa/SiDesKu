export const validateNik = (nik: string): string | null => {
  if (!nik.trim()) return 'NIK wajib diisi';
  if (!/^\d{16}$/.test(nik.trim())) return 'NIK harus terdiri dari 16 digit angka';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Kata sandi wajib diisi';
  if (password.length < 6) return 'Kata sandi minimal 6 karakter';
  return null;
};
