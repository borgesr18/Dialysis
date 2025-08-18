// src/lib/actions/rooms.actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '../supabase/server';

// Ação para CRIAR uma nova sala
export async function createRoom(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const roomData = {
    name: formData.get('name') as string,
    isolation_type: formData.get('isolation_type') as string,
  };

  const { error } = await supabase.from('dialysis_rooms').insert(roomData);

  if (error) {
    console.error('Error creating room:', error);
    return { success: false, message: 'Erro ao criar a sala.' };
  }

  // Invalida o cache da página de salas para que a nova sala apareça
  revalidatePath('/rooms');
  return { success: true, message: 'Sala criada com sucesso!' };
}

// Função para LER todas as salas (pode ser chamada em Server Components)
export async function getRooms() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('dialysis_rooms').select('*');

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
  return data;
}
