import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table
        ref={ref}
        className={clsx('w-full bg-white dark:bg-gray-800', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);

interface THeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const THead = forwardRef<HTMLTableSectionElement, THeadProps>(
  ({ className, children, ...props }, ref) => (
    <thead
      ref={ref}
      className={clsx('bg-gray-50 dark:bg-gray-700', className)}
      {...props}
    >
      {children}
    </thead>
  )
);

interface TBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

const TBody = forwardRef<HTMLTableSectionElement, TBodyProps>(
  ({ className, children, ...props }, ref) => (
    <tbody
      ref={ref}
      className={clsx('divide-y divide-gray-200 dark:divide-gray-700', className)}
      {...props}
    >
      {children}
    </tbody>
  )
);

interface TRProps extends HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

const TR = forwardRef<HTMLTableRowElement, TRProps>(
  ({ className, children, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx('hover:bg-gray-50 dark:hover:bg-gray-700', className)}
      {...props}
    >
      {children}
    </tr>
  )
);

interface THProps extends HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TH = forwardRef<HTMLTableCellElement, THProps>(
  ({ className, children, ...props }, ref) => (
    <th
      ref={ref}
      className={clsx(
        'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
);

interface TDProps extends HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

const TD = forwardRef<HTMLTableCellElement, TDProps>(
  ({ className, children, ...props }, ref) => (
    <td
      ref={ref}
      className={clsx('px-6 py-4 text-sm text-gray-900 dark:text-gray-100', className)}
      {...props}
    >
      {children}
    </td>
  )
);

Table.displayName = 'Table';
THead.displayName = 'THead';
TBody.displayName = 'TBody';
TR.displayName = 'TR';
TH.displayName = 'TH';
TD.displayName = 'TD';

export { Table, THead, TBody, TR, TH, TD };
export type { TableProps, THeadProps, TBodyProps, TRProps, THProps, TDProps };

