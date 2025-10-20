import React, { useEffect, useState } from 'react';
import { Card, Statistic } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined,
  ApartmentOutlined,
  BranchesOutlined
} from '@ant-design/icons';

interface MasterDataStatsProps {
  totalUsers: number;
  totalSatker: number;
  totalBidang: number;
  totalSubBidang: number;
}

const MasterDataStatsCards: React.FC<MasterDataStatsProps> = ({
  totalUsers,
  totalSatker,
  totalBidang,
  totalSubBidang,
}) => {
  const [animatedValues, setAnimatedValues] = useState({
    users: 0,
    satker: 0,
    bidang: 0,
    subBidang: 0
  });

  useEffect(() => {
    // Animate numbers on load
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const intervals = [
      { key: 'users', target: totalUsers },
      { key: 'satker', target: totalSatker },
      { key: 'bidang', target: totalBidang },
      { key: 'subBidang', target: totalSubBidang }
    ];

    intervals.forEach(({ key, target }) => {
      let currentStep = 0;
      const increment = target / steps;
      
      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.min(Math.floor(currentStep * increment), target);
        
        setAnimatedValues(prev => ({
          ...prev,
          [key]: newValue
        }));

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedValues(prev => ({
            ...prev,
            [key]: target
          }));
        }
      }, stepDuration);
    });
  }, [totalUsers, totalSatker, totalBidang, totalSubBidang]);

  const statsData = [
    {
      title: "Total Pengguna",
      value: animatedValues.users,
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: "Satuan Kerja",
      value: animatedValues.satker,
      icon: <TeamOutlined />,
      color: '#52c41a'
    },
    {
      title: "Total Bidang",
      value: animatedValues.bidang,
      icon: <ApartmentOutlined />,
      color: '#faad14'
    },
    {
      title: "Sub Bidang",
      value: animatedValues.subBidang,
      icon: <BranchesOutlined />,
      color: '#722ed1'
    }
  ];

  return (
    <div 
      style={{ 
        display: 'flex',
        gap: '12px',
        flexWrap: 'nowrap',
        overflowX: 'auto'
      }}
    >
      {statsData.map((stat, index) => (
        <Card
          key={index}
          size="small"
          style={{ 
            flex: '1 1 0',
            minWidth: '160px',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
            transition: 'all 0.2s ease'
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <Statistic
            title={stat.title}
            value={stat.value}
            prefix={stat.icon}
            valueStyle={{ 
              color: stat.color,
              fontSize: '20px',
              fontWeight: '600'
            }}
          />
        </Card>
      ))}
    </div>
  );
};

export default MasterDataStatsCards;