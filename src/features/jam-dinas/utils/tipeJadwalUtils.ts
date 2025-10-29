import type { TipeJadwalOption } from '../types';

export const getTipeJadwalLabel = (tipe: TipeJadwalOption): string => {
  const labels: Record<TipeJadwalOption, string> = {
    normal: 'Normal',
    ramadhan: 'Ramadhan'
  };
  
  return labels[tipe] || tipe;
};

export const getTipeJadwalDescription = (tipe: TipeJadwalOption): string => {
  const descriptions: Record<TipeJadwalOption, string> = {
    normal: 'Jadwal kerja standar dengan jam masuk dan pulang biasa',
    ramadhan: 'Jadwal kerja khusus bulan Ramadhan dengan jam kerja yang disesuaikan'
  };
  
  return descriptions[tipe] || '';
};

export const getTipeJadwalColor = (tipe: TipeJadwalOption): string => {
  const colors: Record<TipeJadwalOption, string> = {
    normal: '#1890ff',
    ramadhan: '#52c41a'
  };
  
  return colors[tipe] || '#1890ff';
};