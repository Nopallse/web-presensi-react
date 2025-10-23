import { useAuthStore } from '../../../store/authStore';

export interface AdminAutoFilter {
  satker?: string;
  bidang?: string;
  isAutoFiltered: boolean;
  filterReason: string;
}

/**
 * Hook untuk mendapatkan filter otomatis berdasarkan level admin
 * Level 1 (Superadmin): Tidak ada filter otomatis
 * Level 2 (Admin OPD): Filter berdasarkan satker
 * Level 3 (Admin UPT): Filter berdasarkan satker dan bidang
 */
export const useAdminAutoFilter = (): AdminAutoFilter => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return {
      isAutoFiltered: false,
      filterReason: 'User tidak login'
    };
  }

  // Level 1 = Superadmin - tidak ada auto-filter
  if (user.role === 'super_admin') {
    return {
      isAutoFiltered: false,
      filterReason: 'Superadmin - dapat melihat semua data'
    };
  }

  // Level 2 = Admin OPD - filter berdasarkan satker
  if (user.role === 'admin-opd' && user.admin_opd) {
    return {
      satker: user.admin_opd.id_satker,
      isAutoFiltered: true,
      filterReason: `Admin OPD - terbatas pada satker: ${user.admin_opd.id_satker}`
    };
  }

  // Level 3 = Admin UPT - filter berdasarkan satker dan bidang
  if (user.role === 'admin-upt' && user.admin_upt) {
    return {
      satker: user.admin_upt.id_satker,
      bidang: user.admin_upt.id_bidang,
      isAutoFiltered: true,
      filterReason: `Admin UPT - terbatas pada satker: ${user.admin_upt.id_satker}, bidang: ${user.admin_upt.id_bidang}`
    };
  }

  // Fallback untuk role yang tidak dikenali
  return {
    isAutoFiltered: false,
    filterReason: 'Role tidak dikenali'
  };
};

/**
 * Hook untuk mendapatkan filter yang akan diterapkan (auto-filter + manual filter)
 */
export const useEffectiveFilter = (manualSatker?: string, manualBidang?: string) => {
  const autoFilter = useAdminAutoFilter();

  return {
    satker: autoFilter.satker || manualSatker,
    bidang: autoFilter.bidang || manualBidang,
    isAutoFiltered: autoFilter.isAutoFiltered,
    filterReason: autoFilter.filterReason,
    autoFilter
  };
};
