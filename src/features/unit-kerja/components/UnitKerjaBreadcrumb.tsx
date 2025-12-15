import React from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

interface UnitKerjaBreadcrumbProps {
  items: BreadcrumbItem[];
}

const UnitKerjaBreadcrumb: React.FC<UnitKerjaBreadcrumbProps> = ({ items }) => {
  const navigate = useNavigate();

  const handleBreadcrumbClick = (path: string) => {
    if (path) {
      navigate(path);
    }
  };

  const breadcrumbItems = [
    {
      title: (
        <span 
          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          onClick={() => handleBreadcrumbClick('/unit-kerja')}
        >
          <HomeOutlined />
          Unit Kerja V2
        </span>
      )
    },
    ...items.map((item) => ({
      title: (
        <span 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            cursor: item.path ? 'pointer' : 'default'
          }}
          onClick={item.path ? () => handleBreadcrumbClick(item.path!) : undefined}
        >
          {item.icon}
          {item.title}
        </span>
      )
    }))
  ];

  return (
    <Breadcrumb
      items={breadcrumbItems}
      style={{ marginBottom: '16px' }}
    />
  );
};

export default UnitKerjaBreadcrumb;
