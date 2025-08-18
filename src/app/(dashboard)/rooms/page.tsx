// src/app/(dashboard)/rooms/page.tsx
import { getRooms } from '@/lib/actions/rooms.actions';
import { RoomsTable } from './_components/rooms-table';
import { CreateRoomDialog } from './_components/create-room-dialog';

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Salas de Diálise</h1>
        <CreateRoomDialog />
      </div>
      <RoomsTable rooms={rooms} />
    </div>
  );
}
