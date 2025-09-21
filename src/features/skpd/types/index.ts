export interface SKPD {
  KDSKPD: string;
  NMSKPD: string;
  employee_count: number;
  admin_count: number;
  admins: SKPDAdmin[];
}

export interface SKPDAdmin {
  id: number;
  username: string;
  email: string;
  level: string;
  status: string;
  kategori: string;
}

export interface SKPDListResponse {
  data: SKPD[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  searchQuery?: string | null;
}

export interface SKPDFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface SKPDDetail extends SKPD {
  // Additional detail fields can be added here if needed
}