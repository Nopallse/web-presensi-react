import React, { useState } from 'react';
import { Card, Tabs, Typography, Space } from 'antd';
import { 
  ApartmentOutlined, 
  BankOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import SKPDTab from '../components/SKPDTab';
import SatkerTab from '../components/SatkerTab';
import BidangTab from '../components/BidangTab';
import type { SKPD, SatkerData } from '../types';

const { Title } = Typography;
const { TabPane } = Tabs;

export interface UnitKerjaPageProps {}

const UnitKerjaPage: React.FC<UnitKerjaPageProps> = () => {
  const [activeTab, setActiveTab] = useState('skpd');
  const [selectedSKPD, setSelectedSKPD] = useState<SKPD | null>(null);
  const [selectedSatker, setSelectedSatker] = useState<SatkerData | null>(null);

  const handleSKPDSelect = (skpd: SKPD) => {
    setSelectedSKPD(skpd);
    setSelectedSatker(null);
    setActiveTab('satker');
  };

  const handleSatkerSelect = (satker: SatkerData) => {
    setSelectedSatker(satker);
    setActiveTab('bidang');
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    // Reset selections when going back to earlier tabs
    if (key === 'skpd') {
      setSelectedSKPD(null);
      setSelectedSatker(null);
    } else if (key === 'satker') {
      setSelectedSatker(null);
    }
  };


  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: '8px 0 0 0' }}>
            <ApartmentOutlined /> Unit Kerja
          </Title>
          <Typography.Text type="secondary">
            Kelola struktur organisasi: SKPD, Satuan Kerja, dan Bidang
          </Typography.Text>
        </div>

        <Card>
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange}
            type="card"
            size="large"
          >
            <TabPane
              tab={
                <span>
                  <BankOutlined />
                  SKPD
                </span>
              }
              key="skpd"
            >
              <SKPDTab onSelectSKPD={handleSKPDSelect} />
            </TabPane>

            <TabPane
              tab={
                <span>
                  <ApartmentOutlined />
                  Satuan Kerja
                  {selectedSKPD && (
                    <Typography.Text 
                      type="secondary" 
                      style={{ fontSize: '11px', marginLeft: '4px' }}
                    >
                      ({selectedSKPD.KDSKPD})
                    </Typography.Text>
                  )}
                </span>
              }
              key="satker"
              disabled={!selectedSKPD}
            >
              {selectedSKPD && (
                <SatkerTab 
                  skpd={selectedSKPD} 
                  onSelectSatker={handleSatkerSelect}
                />
              )}
            </TabPane>

            <TabPane
              tab={
                <span>
                  <TeamOutlined />
                  Bidang
                  {selectedSatker && (
                    <Typography.Text 
                      type="secondary" 
                      style={{ fontSize: '11px', marginLeft: '4px' }}
                    >
                      ({selectedSatker.KDSATKER})
                    </Typography.Text>
                  )}
                </span>
              }
              key="bidang"
              disabled={!selectedSKPD || !selectedSatker}
            >
              {selectedSKPD && selectedSatker && (
                <BidangTab 
                  skpd={selectedSKPD}
                  satker={selectedSatker}
                />
              )}
            </TabPane>
          </Tabs>
        </Card>
      </Space>
    </div>
  );
};

export default UnitKerjaPage;