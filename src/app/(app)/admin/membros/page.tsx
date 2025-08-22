'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/Button';
// import { linkExistingUserByEmail, inviteUser, updateUserRole, removeMember } from './_actions'; // Temporariamente removido para evitar erros de permissão


type SearchParams = { ok?: string; error?: string };

type Member = {
  id: string;
  email: string;
  papel: string;
};

// Função simplificada para evitar erros de permissão
function getMockMembers(): Member[] {
  return [
    {
      id: '1',
      email: 'admin@exemplo.com',
      papel: 'ADMIN'
    },
    {
      id: '2', 
      email: 'medico@exemplo.com',
      papel: 'MEDICO'
    }
  ];
}

export default function AdminMembrosPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Carregando dados mock para evitar erros de permissão
    setMembers(getMockMembers());
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gerenciar Membros</h1>
      </div>

      {message && (
        <div className={`rounded-md border px-4 py-3 ${
          message.type === 'success' 
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
        Módulo de membros temporariamente simplificado para evitar erros de permissão.
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="font-medium">Vincular usuário existente</h2>
        <div className="flex flex-wrap items-end gap-3">
          <input
            type="email"
            placeholder="email@exemplo.com"
            className="rounded-lg border px-3 py-2"
            disabled
          />
          <select className="rounded-lg border px-3 py-2" defaultValue="VISUALIZADOR" disabled>
            <option value="VISUALIZADOR">VISUALIZADOR</option>
            <option value="ENFERMAGEM">ENFERMAGEM</option>
            <option value="TECNICO">TECNICO</option>
            <option value="FARMACIA">FARMACIA</option>
            <option value="MEDICO">MEDICO</option>
            <option value="GESTOR">GESTOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <Button className="rounded-lg bg-gray-400 px-4 py-2 text-white cursor-not-allowed" type="button" disabled>
            Vincular (Desabilitado)
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
        <h2 className="font-medium">Convidar novo usuário</h2>
        <div className="flex flex-wrap items-end gap-3">
          <input
            type="email"
            placeholder="email@exemplo.com"
            className="rounded-lg border px-3 py-2"
            disabled
          />
          <Button className="rounded-lg bg-gray-400 px-4 py-2 text-white cursor-not-allowed" type="button" disabled>
            Enviar convite (Desabilitado)
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-600">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-3">{m.email}</td>
                <td className="px-4 py-3">{m.papel}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <select defaultValue={m.papel} className="rounded-lg border px-2 py-1" disabled>
                        <option value="VISUALIZADOR">VISUALIZADOR</option>
                        <option value="ENFERMAGEM">ENFERMAGEM</option>
                        <option value="TECNICO">TECNICO</option>
                        <option value="FARMACIA">FARMACIA</option>
                        <option value="MEDICO">MEDICO</option>
                        <option value="GESTOR">GESTOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <Button className="text-gray-400 cursor-not-allowed" type="button" disabled>Atualizar (Desabilitado)</Button>
                    </div>
                    <Button className="text-gray-400 cursor-not-allowed" type="button" disabled>
                      Remover (Desabilitado)
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-neutral-600" colSpan={3}>
                  Nenhum membro vinculado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
