import React from 'react';
import { cn } from '../../utils/cn';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-white border-t border-gray-200', className)}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">
              © {currentYear} Presensi Dashboard. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Bantuan
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Kebijakan Privasi
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Syarat & Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;