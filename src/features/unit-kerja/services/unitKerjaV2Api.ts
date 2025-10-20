import { apiClient } from '../../../services/apiService';

export interface Satker {
  KDSATKER: string;
  NMSATKER: string;
  NAMA_JABATAN: string;
  JENIS_JABATAN: string;
  KDSKPD: string;
  bidangCount: number;
  lokasi?: Lokasi;
}

export interface Bidang {
  BIDANGF: string;
  NMBIDANG: string;
  NAMA_JABATAN: string;
  JENIS_JABATAN: string;
  KDSATKER: string;
  subBidangCount: number;
  lokasi?: Lokasi;
}

export interface SubBidang {
  SUBF: string;
  NMSUB: string;
  NAMA_JABATAN: string;
  BIDANGF: string;
  lokasi?: Lokasi;
}

export interface JamDinasDetail {
  id: number;
  id_jamdinas: number;
  hari: number;
  tipe: string;
  jam_masuk_mulai: string;
  jam_masuk_selesai: string;
  jam_pulang_mulai: string;
  jam_pulang_selesai: string;
}

export interface JamDinas {
  id: number;
  nama: string;
  hari_kerja: number;
  menit: number;
  status: number;
  details?: JamDinasDetail[];
}

export interface JamDinasAssignment {
  assignmentId: number;
  assignmentName: string;
  jamDinas: JamDinas;
}

export interface Lokasi {
  lokasi_id: number;
  id_unit_kerja: string;
  kd_unit_kerja: string;
  level_unit_kerja: number;
  id_satker: string;
  id_bidang?: string;
  id_sub_bidang?: string;
  lat: number;
  lng: number;
  range: number;
  nama_lokasi?: string;
  alamat?: string;
  ket?: string;
  is_inherited: boolean;
  status: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  level?: string;
  source?: string;
}

export interface UnitKerjaResponse {
  data: Satker[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  searchQuery?: string;
}

export interface SatkerDetailResponse {
  satker: Satker;
  bidang: {
    data: Bidang[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  };
  jamDinas?: JamDinasAssignment[];
  searchQuery?: string;
}

export interface BidangDetailResponse {
  satker: Satker;
  bidang: Bidang & { totalSubBidangCount: number };
  subBidang: {
    data: SubBidang[];
    pagination: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
    };
  };
  searchQuery?: string;
}

export interface SubBidangDetailResponse {
  satker: Satker;
  bidang: Bidang;
  subBidang: SubBidang;
}

export const unitKerjaV2Api = {
  // Mendapatkan semua satker
  getAllSatker: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<UnitKerjaResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/unit-kerja?${searchParams.toString()}`);
    return response.data;
  },

  // Mendapatkan detail satker beserta bidang-bidangnya
  getSatkerDetail: async (idSatker: string, params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<SatkerDetailResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/unit-kerja/${idSatker}?${searchParams.toString()}`);
    return response.data;
  },

  // Mendapatkan detail bidang beserta sub-bidangnya
  getBidangDetail: async (idSatker: string, idBidang: string, params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<BidangDetailResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await apiClient.get(`/unit-kerja/${idSatker}/${idBidang}?${searchParams.toString()}`);
    return response.data;
  },

  // Mendapatkan detail sub-bidang
  getSubBidangDetail: async (idSatker: string, idBidang: string, idSubBidang: string): Promise<SubBidangDetailResponse> => {
    const response = await apiClient.get(`/unit-kerja/${idSatker}/${idBidang}/${idSubBidang}`);
    return response.data;
  },

  // Mengatur lokasi satker
  setSatkerLocation: async (idSatker: string, locationData: {
    lat: number;
    lng: number;
    range?: number;
    ket?: string;
    status?: boolean;
  }): Promise<{ message: string; data: Lokasi }> => {
    const response = await apiClient.post(`/unit-kerja/${idSatker}/location`, locationData);
    return response.data;
  },

  // Mengatur lokasi bidang
  setBidangLocation: async (idSatker: string, idBidang: string, locationData: {
    lat: number;
    lng: number;
    range?: number;
    ket?: string;
    status?: boolean;
  }): Promise<{ message: string; data: Lokasi }> => {
    const response = await apiClient.post(`/unit-kerja/${idSatker}/${idBidang}/location`, locationData);
    return response.data;
  },

  // Mengatur lokasi sub-bidang
  setSubBidangLocation: async (idSatker: string, idBidang: string, idSubBidang: string, locationData: {
    lat: number;
    lng: number;
    range?: number;
    ket?: string;
    status?: boolean;
  }): Promise<{ message: string; data: Lokasi }> => {
    const response = await apiClient.post(`/unit-kerja/${idSatker}/${idBidang}/${idSubBidang}/location`, locationData);
    return response.data;
  },

  // Mendapatkan semua lokasi untuk satker
  getSatkerLocations: async (idSatker: string): Promise<{ data: Lokasi[] }> => {
    const response = await apiClient.get(`/unit-kerja/${idSatker}/locations`);
    return response.data;
  },

  // Mendapatkan hierarki lokasi
  getLocationHierarchy: async (idSatker: string): Promise<any> => {
    const response = await apiClient.get(`/unit-kerja/${idSatker}/location-hierarchy`);
    return response.data;
  },

  // Mengaktifkan lokasi satker
  activateSatkerLocation: async (idSatker: string): Promise<{ message: string; data: Lokasi }> => {
    const response = await apiClient.put(`/unit-kerja/${idSatker}/activate-location`);
    return response.data;
  },

  // Mengaktifkan lokasi bidang
  activateBidangLocation: async (idSatker: string, idBidang: string): Promise<{ message: string; data: Lokasi }> => {
    const response = await apiClient.put(`/unit-kerja/${idSatker}/${idBidang}/activate-location`);
    return response.data;
  },

  // Mengaktifkan lokasi sub-bidang
  activateSubBidangLocation: async (idSatker: string, idBidang: string, idSubBidang: string): Promise<{ message: string; data: Lokasi }> => {
    const response = await apiClient.put(`/unit-kerja/${idSatker}/${idBidang}/${idSubBidang}/activate-location`);
    return response.data;
  },

  // Assign jam dinas untuk satker
  assignSatkerJamDinas: async (idSatker: string, data: {
    idJamDinas: number;
    assignmentName: string;
  }): Promise<{ message: string; data: any }> => {
    const response = await apiClient.post(`/unit-kerja/${idSatker}/jam-dinas`, data);
    return response.data;
  },

  // Assign jam dinas untuk bidang
  assignBidangJamDinas: async (idSatker: string, idBidang: string, data: {
    idJamDinas: number;
    assignmentName: string;
  }): Promise<{ message: string; data: any }> => {
    const response = await apiClient.post(`/unit-kerja/${idSatker}/${idBidang}/jam-dinas`, data);
    return response.data;
  },

  // Hapus jam dinas assignment
  removeJamDinasAssignment: async (assignmentId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/unit-kerja/jam-dinas/${assignmentId}`);
    return response.data;
  }
};
