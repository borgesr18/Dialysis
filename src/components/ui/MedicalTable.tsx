import { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Eye, Edit, Trash2, Download, Filter } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { StatusBadge } from './StatusBadge';
import { clsx } from 'clsx';

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface TableAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: (row: any) => void;
  variant?: 'default' | 'primary' | 'danger';
  show?: (row: any) => boolean;
}

interface MedicalTableProps {
  columns: TableColumn[];
  data: any[];
  actions?: TableAction[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  showActions?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
  };
}

export function MedicalTable({
  columns,
  data,
  actions = [],
  onSort,
  sortColumn,
  sortDirection,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
  className,
  showActions = true,
  selectable = false,
  onSelectionChange,
  pagination,
}: MedicalTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [expandedActions, setExpandedActions] = useState<string | null>(null);

  const handleSort = (column: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
    
    const selectedData = data.filter(row => newSelected.has(row.id));
    onSelectionChange?.(selectedData);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? new Set(data.map(row => row.id)) : new Set();
    setSelectedRows(newSelected);
    
    const selectedData = checked ? data : [];
    onSelectionChange?.(selectedData);
  };

  const renderCell = (column: TableColumn, row: any) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    // Default rendering for common medical data types
    if (column.key === 'status') {
      return <StatusBadge status={value} />;
    }
    
    if (column.key.includes('data') || column.key.includes('Data')) {
      if (!value) return '-';
      try {
        return new Date(value).toLocaleDateString('pt-BR');
      } catch {
        return value;
      }
    }
    
    if (column.key.includes('hora') || column.key.includes('Hora')) {
      if (!value) return '-';
      try {
        return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      } catch {
        return value;
      }
    }
    
    return value || '-';
  };

  const renderActions = (row: any) => {
    const visibleActions = actions.filter(action => !action.show || action.show(row));
    
    if (visibleActions.length === 0) return null;
    
    if (visibleActions.length <= 2) {
      return (
        <div className="flex items-center space-x-1">
          {visibleActions.map(action => (
            <Button
              key={action.key}
              variant="outline"
              size="sm"
              onClick={() => action.onClick(row)}
              className={clsx(
                'p-1 h-8 w-8',
                action.variant === 'danger' && 'text-red-600 hover:text-red-700 hover:bg-red-50',
                action.variant === 'primary' && 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
              )}
              title={action.label}
            >
              {action.icon}
            </Button>
          ))}
        </div>
      );
    }
    
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpandedActions(expandedActions === row.id ? null : row.id)}
          className="p-1 h-8 w-8"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
        
        {expandedActions === row.id && (
          <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
            {visibleActions.map(action => (
              <button
                key={action.key}
                onClick={() => {
                  action.onClick(row);
                  setExpandedActions(null);
                }}
                className={clsx(
                  'w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2',
                  action.variant === 'danger' && 'text-red-600 hover:bg-red-50',
                  action.variant === 'primary' && 'text-blue-600 hover:bg-blue-50'
                )}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={clsx('overflow-hidden', className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={clsx(
                            'w-3 h-3 -mb-1',
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          )}
                        />
                        <ChevronDown 
                          className={clsx(
                            'w-3 h-3',
                            sortColumn === column.key && sortDirection === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {showActions && actions.length > 0 && (
                <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr 
                  key={row.id || index}
                  className={clsx(
                    'hover:bg-gray-50',
                    selectedRows.has(row.id) && 'bg-blue-50'
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  
                  {columns.map((column) => (
                    <td 
                      key={column.key}
                      className={clsx(
                        'px-4 py-3 text-sm text-gray-900',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.className
                      )}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                  
                  {showActions && actions.length > 0 && (
                    <td className="px-4 py-3 text-center">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
              {pagination.totalItems} registros
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-gray-700">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Ações pré-configuradas comuns
export const commonTableActions: TableAction[] = [
  {
    key: 'view',
    label: 'Visualizar',
    icon: <Eye className="w-4 h-4" />,
    onClick: (row) => console.log('View', row),
  },
  {
    key: 'edit',
    label: 'Editar',
    icon: <Edit className="w-4 h-4" />,
    onClick: (row) => console.log('Edit', row),
    variant: 'primary',
  },
  {
    key: 'delete',
    label: 'Excluir',
    icon: <Trash2 className="w-4 h-4" />,
    onClick: (row) => console.log('Delete', row),
    variant: 'danger',
  },
];