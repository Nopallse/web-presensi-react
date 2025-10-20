import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ViewDaftarUnitKerja } from '../types/viewDaftarUnitKerja';

interface ViewDaftarUnitKerjaDetailProps {
  item: ViewDaftarUnitKerja;
  onClose: () => void;
}

const ViewDaftarUnitKerjaDetail: React.FC<ViewDaftarUnitKerjaDetailProps> = ({ item, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Langsung redirect ke halaman detail
    navigate(`/unit-kerja/${item.kd_unit_kerja}`);
    onClose(); // Tutup modal/popup yang memanggil komponen ini
  }, [navigate, item.kd_unit_kerja, onClose]);
  // Komponen ini hanya melakukan redirect, tidak menampilkan UI
  return null;
};

export default ViewDaftarUnitKerjaDetail;
