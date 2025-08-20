import { useState, useEffect } from 'react';
import { AlertCircle, Save, X, Calendar, Clock, User, Activity } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Select, Option } from './Select';
import { MedicalAlert } from './MedicalAlert';
import { clsx } from 'clsx';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'time' | 'datetime-local' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Option[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  unit?: string;
  help?: string;
  disabled?: boolean;
  dependsOn?: string;
  showWhen?: (formData: any) => boolean;
}

interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface MedicalFormProps {
  sections: FormSection[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  loading?: boolean;
  className?: string;
  submitLabel?: string;
  cancelLabel?: string;
  showProgress?: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export function MedicalForm({
  sections,
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  className,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  showProgress = false,
}: MedicalFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Initialize expanded sections
    const defaultExpanded = new Set<string>();
    sections.forEach((section, index) => {
      if (section.defaultExpanded !== false) {
        defaultExpanded.add(section.title);
      }
    });
    setExpandedSections(defaultExpanded);
  }, [sections]);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return `${field.label} é obrigatório`;
    }

    if (field.validation && value) {
      const { min, max, pattern, custom } = field.validation;

      if (min !== undefined && Number(value) < min) {
        return `${field.label} deve ser maior ou igual a ${min}`;
      }

      if (max !== undefined && Number(value) > max) {
        return `${field.label} deve ser menor ou igual a ${max}`;
      }

      if (pattern && value && !new RegExp(pattern).test(value)) {
        return `${field.label} tem formato inválido`;
      }

      if (custom) {
        const customError = custom(value);
        if (customError) return customError;
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.showWhen && !field.showWhen(formData)) return;
        
        const error = validateField(field, formData[field.key]);
        if (error) {
          newErrors[field.key] = error;
          hasErrors = true;
        }
      });
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleFieldChange = (key: string, value: any) => {
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);

    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const toggleSection = (sectionTitle: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionTitle)) {
      newExpanded.delete(sectionTitle);
    } else {
      newExpanded.add(sectionTitle);
    }
    setExpandedSections(newExpanded);
  };

  const renderField = (field: FormField) => {
    if (field.showWhen && !field.showWhen(formData)) {
      return null;
    }

    const value = formData[field.key] || '';
    const error = errors[field.key];
    const fieldId = `field-${field.key}`;

    const baseInputProps = {
      id: fieldId,
      value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => 
        handleFieldChange(field.key, e.target.value),
      placeholder: field.placeholder,
      disabled: field.disabled || loading,
      className: clsx(
        error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
      ),
    };

    let inputElement;

    switch (field.type) {
      case 'select':
        inputElement = (
          <Select
            value={formData[field.key] || ''}
            onChange={(value) => handleFieldChange(field.key, value)}
            options={field.options || []}
            placeholder={field.placeholder || `Selecione ${field.label.toLowerCase()}`}
            error={errors[field.key]}
            disabled={field.disabled}
          />
        );
        break;

      case 'textarea':
        inputElement = (
          <textarea
            {...baseInputProps}
            rows={3}
            className={clsx(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-500'
            )}
          />
        );
        break;

      default:
        inputElement = (
          <div className="relative">
            <Input
              {...baseInputProps}
              type={field.type}
              min={field.validation?.min}
              max={field.validation?.max}
              pattern={field.validation?.pattern}
            />
            {field.unit && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">{field.unit}</span>
              </div>
            )}
          </div>
        );
    }

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={fieldId} className="flex items-center space-x-1">
          <span>{field.label}</span>
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        
        {inputElement}
        
        {field.help && (
          <p className="text-sm text-gray-600">{field.help}</p>
        )}
        
        {error && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  const totalFields = sections.reduce((total, section) => 
    total + section.fields.filter(field => !field.showWhen || field.showWhen(formData)).length, 0
  );
  const filledFields = sections.reduce((total, section) => 
    total + section.fields.filter(field => 
      (!field.showWhen || field.showWhen(formData)) && formData[field.key]
    ).length, 0
  );
  const progress = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className={clsx('space-y-6', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso do Formulário</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>
      )}

      {/* Form Sections */}
      {sections.map((section, sectionIndex) => {
        const isExpanded = expandedSections.has(section.title);
        
        return (
          <Card key={section.title} className="overflow-hidden">
            {/* Section Header */}
            <div 
              className={clsx(
                'p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50',
                !section.collapsible && 'cursor-default hover:bg-white'
              )}
              onClick={() => section.collapsible && toggleSection(section.title)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                  {section.description && (
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  )}
                </div>
                
                {section.collapsible && (
                  <div className="text-gray-400">
                    {isExpanded ? '−' : '+'}
                  </div>
                )}
              </div>
            </div>

            {/* Section Content */}
            {(!section.collapsible || isExpanded) && (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map(renderField)}
                </div>
              </div>
            )}
          </Card>
        );
      })}

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            {cancelLabel}
          </Button>
        )}
        
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Salvando...</span>
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// Validações comuns para dados médicos
export const medicalValidations = {
  weight: (value: number) => {
    if (value < 20 || value > 300) {
      return 'Peso deve estar entre 20kg e 300kg';
    }
    return null;
  },
  
  bloodPressure: (value: string) => {
    const pattern = /^\d{2,3}\/\d{2,3}$/;
    if (!pattern.test(value)) {
      return 'Pressão arterial deve estar no formato XXX/XX';
    }
    const [systolic, diastolic] = value.split('/').map(Number);
    if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) {
      return 'Valores de pressão arterial fora do intervalo normal';
    }
    return null;
  },
  
  ultrafiltration: (value: number) => {
    if (value < 0 || value > 10000) {
      return 'Ultrafiltração deve estar entre 0ml e 10000ml';
    }
    return null;
  },
  
  ktv: (value: number) => {
    if (value < 0 || value > 5) {
      return 'Kt/V deve estar entre 0 e 5';
    }
    return null;
  },
  
  urr: (value: number) => {
    if (value < 0 || value > 100) {
      return 'URR deve estar entre 0% e 100%';
    }
    return null;
  },
};