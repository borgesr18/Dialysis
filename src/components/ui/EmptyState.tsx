import { ReactNode } from 'react';
import { LinkButton } from './LinkButton';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 text-gray-400 dark:text-gray-500">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <LinkButton href={action.href} variant="primary">
            {action.label}
          </LinkButton>
        </div>
      )}
    </div>
  );
}

