import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import type { ViewDaftarUnitKerja } from '../types/viewDaftarUnitKerja';
import ViewDaftarUnitKerjaDetail from '../components/ViewDaftarUnitKerjaDetail';
import UnitKerjaLevelTabs from '../components/UnitKerjaLevelTabs';

const { Title } = Typography;

export interface UnitKerjaPageProps {}

const UnitKerjaPage: React.FC<UnitKerjaPageProps> = () => {
  const [selectedItem, setSelectedItem] = useState<ViewDaftarUnitKerja | null>(null);

  const handleItemClick = (item: ViewDaftarUnitKerja) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '100%', overflow: 'hidden' }}>
      <Card>
        {/* Header */}
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
          <ApartmentOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#1890ff' }} />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Unit Kerja
            </Title>
            <p style={{ margin: '4px 0 0 0', color: '#666' }}>
              Kelola dan lihat data unit kerja: Satuan Kerja, Bidang, dan Sub Bidang
            </p>
          </div>
        </div>

        {/* Main Content */}
        <UnitKerjaLevelTabs onItemClick={handleItemClick} />

        {/* Detail Modal */}
        {selectedItem && (
          <ViewDaftarUnitKerjaDetail 
            item={selectedItem} 
            onClose={handleCloseDetail} 
          />
        )}
      </Card>
    </div>
  );
};

export default UnitKerjaPage;