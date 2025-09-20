import { cn } from '../../utils/cn';
import type { TableColumn } from '../../types/global';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  className?: string;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
}

function Table<T = any>({
  data,
  columns,
  loading = false,
  emptyMessage = 'Tidak ada data',
  onSort,
  sortColumn,
  sortDirection,
  className,
  rowClassName,
  onRowClick
}: TableProps<T>) {
  const handleSort = (columnKey: string) => {
    if (!onSort) return;
    
    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  const renderCellContent = (column: TableColumn<T>, item: T) => {
    if (column.render) {
      return column.render(item[column.key as keyof T], item);
    }
    
    const value = item[column.key as keyof T];
    return value != null ? String(value) : '-';
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg', className)}>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.sortable && onSort && 'cursor-pointer hover:bg-gray-100',
                  column.className
                )}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && onSort && (
                    <span className="flex flex-col">
                      <ChevronUp 
                        className={cn(
                          'h-3 w-3',
                          sortColumn === column.key && sortDirection === 'asc' 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                        )} 
                      />
                      <ChevronDown 
                        className={cn(
                          'h-3 w-3 -mt-1',
                          sortColumn === column.key && sortDirection === 'desc' 
                            ? 'text-gray-900' 
                            : 'text-gray-400'
                        )} 
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  'hover:bg-gray-50 transition-colors',
                  onRowClick && 'cursor-pointer',
                  rowClassName && rowClassName(item)
                )}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                      column.className
                    )}
                  >
                    {renderCellContent(column, item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;