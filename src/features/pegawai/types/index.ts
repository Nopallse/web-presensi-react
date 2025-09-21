export interface Pegawai {
  id: number;
  username: string;
  email?: string;
  password_reset_token?: string;
  level: string;
  id_opd?: string;
  id_upt?: string;
  status: string;
  device_id?: string;
  fcm_token?: string;
  refresh_token?: string;
  createdAt?: string;
  updatedAt?: string;
  nama?: string;
  nip: string;
  kdskpd?: string;
  kdsatker?: string;
  bidangf?: string;
  kdpangkat?: string;
  jenis_jabatan?: string;
  kdjenkel?: number;
  tempatlhr?: string;
  tgllhr?: string;
  agama?: number;
  alamat?: string;
  notelp?: string;
  noktp?: string;
  foto?: string;
  jenis_pegawai?: string;
  status_aktif?: string;
  skpd?: {
    kdskpd: string;
    nmskpd: string;
    status_skpd: string;
  };
  satker?: {
    kdsatker: string;
    nmsatker: string;
  };
  bidang?: {
    bidangf: string;
    nmbidang: string;
  };
}

export interface PegawaiListResponse {
  data: Pegawai[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  filter?: {
    id_skpd?: string;
  };
}

export interface PegawaiFilters {
  page?: number;
  limit?: number;
  kdskpd?: string;
  search?: string;
}

export interface SKPD {
  id: string;
  kode: string;
  nama: string;
}