import { useState } from 'react';
import { Filter, X, Calendar, User, Activity } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Select, Option } from './Select';
import { clsx } from 'clsx';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: Option[];
  placeholder?: string;
}

interface MedicalFiltersProps {
  fields: FilterField[];
  onFiltersChange: (filters: Record<string, any>) => void;
  onReset?: () => void;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function MedicalFilters({
  fields,
  onFiltersChange,
  onReset,
  className,
  collapsible = true,
  defaultExpanded = false,
}: MedicalFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Remove empty values
    if (!value || value === '') {
      delete newFilters[key];
    }
    
    setFilters(newFilters);
    setActiveFiltersCount(Object.keys(newFilters).length);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    setActiveFiltersCount(0);
    onFiltersChange({});
    onReset?.();
  };

  const renderField = (field: FilterField) => {
    const value = filters[field.key] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.key}
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <Select
            value={filters[field.key] || ''}
            onChange={(value) => handleFilterChange(field.key, value)}
            options={field.options || []}
            placeholder={field.placeholder}
          />
        );

      case 'date':
        return (
          <Input
            id={field.key}
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
          />
        );

      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={filters[`${field.key}_inicio`] || ''}
              onChange={(e) => handleFilterChange(`${field.key}_inicio`, e.target.value)}
              placeholder="Data início"
            />
            <Input
              type="date"
              value={filters[`${field.key}_fim`] || ''}
              onChange={(e) => handleFilterChange(`${field.key}_fim`, e.target.value)}
              placeholder="Data fim"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={clsx('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFiltersCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            
            {collapsible && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-600 hover:text-gray-800"
              >
                {isExpanded ? 'Recolher' : 'Expandir'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Content */}
      {(!collapsible || isExpanded) && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                  {field.label}
                </Label>
                {renderField(field)}
              </div>
            ))}
          </div>
          
          {fields.length > 0 && (
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={activeFiltersCount === 0}
              >
                Limpar Filtros
              </Button>
              <Button
                onClick={() => onFiltersChange(filters)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Aplicar Filtros
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Filtros pré-configurados para diferentes contextos
export const sessionFilters: FilterField[] = [
  {
    key: 'paciente',
    label: 'Paciente',
    type: 'select',
    placeholder: 'Todos os pacientes',
    options: [
      { value: '1', label: 'João Silva' },
      { value: '2', label: 'Maria Santos' },
      { value: '3', label: 'Pedro Oliveira' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Todos os status',
    options: [
      { value: 'agendada', label: 'Agendada' },
      { value: 'em_andamento', label: 'Em Andamento' },
      { value: 'concluida', label: 'Concluída' },
      { value: 'cancelada', label: 'Cancelada' },
    ],
  },
  {
    key: 'maquina',
    label: 'Máquina',
    type: 'select',
    placeholder: 'Todas as máquinas',
    options: [
      { value: '1', label: 'Máquina 01' },
      { value: '2', label: 'Máquina 02' },
      { value: '3', label: 'Máquina 03' },
    ],
  },
  {
    key: 'periodo',
    label: 'Período',
    type: 'dateRange',
  },
];

export const patientFilters: FilterField[] = [
  {
    key: 'nome',
    label: 'Nome',
    type: 'text',
    placeholder: 'Buscar por nome...',
  },
  {
    key: 'status_tratamento',
    label: 'Status do Tratamento',
    type: 'select',
    placeholder: 'Todos os status',
    options: [
      { value: 'ativo', label: 'Ativo' },
      { value: 'inativo', label: 'Inativo' },
      { value: 'transferido', label: 'Transferido' },
    ],
  },
  {
    key: 'tipo_acesso',
    label: 'Tipo de Acesso',
    type: 'select',
    placeholder: 'Todos os tipos',
    options: [
      { value: 'fav', label: 'FAV' },
      { value: 'cateter', label: 'Cateter' },
      { value: 'protese', label: 'Prótese' },
    ],
  },
  {
    key: 'data_cadastro',
    label: 'Data de Cadastro',
    type: 'dateRange',
  },
];

export const machineFilters: FilterField[] = [
  {
    key: 'numero',
    label: 'Número da Máquina',
    type: 'text',
    placeholder: 'Ex: 01, 02...',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'Todos os status',
    options: [
      { value: 'disponivel', label: 'Disponível' },
      { value: 'ocupada', label: 'Ocupada' },
      { value: 'manutencao', label: 'Manutenção' },
      { value: 'inativa', label: 'Inativa' },
    ],
  },
  {
    key: 'turno',
    label: 'Turno',
    type: 'select',
    placeholder: 'Todos os turnos',
    options: [
      { value: 'MANHA', label: 'Manhã' },
      { value: 'TARDE', label: 'Tarde' },
      { value: 'NOITE', label: 'Noite' },
    ],
  },
  {
    key: 'ultima_manutencao',
    label: 'Última Manutenção',
    type: 'dateRange',
  },
];