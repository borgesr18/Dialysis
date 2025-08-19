import clsx from 'clsx';
import type { PropsWithChildren, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
export function Table({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLTableElement>>) { return <table className={clsx('min-w-full text-sm', className)} {...props}>{children}</table>; }
export function THead({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) { return <thead className={clsx('bg-gray-50', className)} {...props}>{children}</thead>; }
export function TBody({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>) { return <tbody className={clsx('', className)} {...props}>{children}</tbody>; }
export function TR({ className, children, ...props }: PropsWithChildren<HTMLAttributes<HTMLTableRowElement>>) { return <tr className={clsx(className)} {...props}>{children}</tr>; }
export function TH({ className, children, ...props }: PropsWithChildren<ThHTMLAttributes<HTMLTableCellElement>>) { return <th className={clsx('px-4 py-3 text-left text-neutral-600', className)} {...props}>{children}</th>; }
export function TD({ className, children, ...props }: PropsWithChildren<TdHTMLAttributes<HTMLTableCellElement>>) { return <td className={clsx('px-4 py-3', className)} {...props}>{children}</td>; }
