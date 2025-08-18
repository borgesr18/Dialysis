// src/app/(dashboard)/rooms/_components/rooms-table.tsx
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DialysisRoom } from '@/types';

interface RoomsTableProps {
  rooms: DialysisRoom[];
}

const isolationTypeMap = {
  none: 'Nenhum',
  hbsag_positive: 'Hepatite B (HBsAg+)',
  hcv_positive: 'Hepatite C (HCV+)',
};

export function RoomsTable({ rooms }: RoomsTableProps) {
  if (rooms.length === 0) {
    return <p className="text-center text-gray-500">Nenhuma sala cadastrada.</p>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo de Isolamento</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium">{room.name}</TableCell>
              <TableCell>{isolationTypeMap[room.isolation_type]}</TableCell>
              <TableCell>
                {new Date(room.created_at).toLocaleDateString('pt-BR')}
              </TableCell>
              <TableCell className="text-right">
                {/* Botões de Editar e Excluir virão aqui */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
