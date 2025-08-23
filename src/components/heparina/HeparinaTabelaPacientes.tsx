'use client';

import { useState } from 'react';
import { Edit2, Save, X, AlertTriangle, Check, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { useSupabase } from '@/hooks/useSupabase';
import { Database } from '@/types/database';
import { toast } from 'sonner';

type Paciente = Database['public']['Tables']['pacientes']['Row'];
type DoseHeparina = Database['public']['Tables']['doses_heparina']['Row'];
type SessaoHemodialise = Database['public']['Tables']['sessoes_hemodialise']['Row'];
type AcessoVascular = Database['public']['Tables']['acessos_vasculares']['Row'];

interface PacienteComDose extends Paciente {
  dose_heparina?: DoseHeparina;
  sessao_atual?: SessaoHemodialise;
  acesso_vascular?: AcessoVascular;
  cidade?: string;
  maquina_numero?: number | string;
  nome?: string;
}

interface Props {
  pacientes: PacienteComDose[];
  onDoseUpdate: () => void;
}

interface DoseEditando {
  pacienteId: string;
  doseHeparina: string;
  doseCateter: string;
  observacoes: string;
}

// Limites de dose baseados no tipo de acesso
const LIMITES_DOSE = {
  FAV: { min: 5000, max: 10000 },
  CDL: { min: 1000, max: 5000 },
  PC: { min: 1000, max: 5000 }
};

export default function HeparinaTabelaPacientes({ pacientes, onDoseUpdate }: Props) {
  const { supabase } = useSupabase();
  const [editando, setEditando] = useState<DoseEditando | null>(null);
  const [salvando, setSalvando] = useState(false);

  const iniciarEdicao = (paciente: PacienteComDose) => {
    setEditando({
      pacienteId: paciente.id,
      doseHeparina: paciente.dose_heparina?.dose_heparina?.toString() || '',
      doseCateter: paciente.dose_heparina?.dose_cateter?.toString() || '',
      observacoes: paciente.dose_heparina?.observacoes || ''
    });
  };

  const cancelarEdicao = () => {
    setEditando(null);
  };

  const salvarDose = async () => {
    if (!editando) return;

    try {
      setSalvando(true);
      
      const paciente = pacientes.find(p => p.id === editando.pacienteId);
      if (!paciente) return;

      const doseHeparina = parseFloat(editando.doseHeparina) || 0;
      const doseCateter = parseFloat(editando.doseCateter) || 0;
      
      // Validar limites de dose
      const tipoAcesso = paciente.acesso_vascular?.tipo as keyof typeof LIMITES_DOSE;
      if (!tipoAcesso) {
        toast.error('Tipo de acesso do paciente não encontrado. Cadastre o acesso vascular.');
        return;
      }
      if (LIMITES_DOSE[tipoAcesso]) {
        const limites = LIMITES_DOSE[tipoAcesso];
        if (doseHeparina < limites.min || doseHeparina > limites.max) {
          toast.error(`Dose fora dos limites para ${tipoAcesso}: ${limites.min} - ${limites.max} UI`);
          return;
        }
      }

      const user = (await supabase.auth.getUser()).data.user;

      const dadosDose = {
        paciente_id: paciente.id,
        dose_heparina: doseHeparina,
        dose_cateter: doseCateter,
        observacoes: editando.observacoes,
        data_prescricao: new Date().toISOString(),
        tipo_acesso: tipoAcesso as any,
        prescrito_por: user?.id as string,
        clinica_id: paciente.clinica_id,
      } as any;

      if (paciente.dose_heparina?.id) {
        // Atualizar dose existente
        const { error } = await supabase
          .from('doses_heparina')
          .update(dadosDose)
          .eq('id', paciente.dose_heparina.id);

        if (error) throw error;
      } else {
        // Criar nova dose
        const { error } = await supabase
          .from('doses_heparina')
          .insert(dadosDose as any);

        if (error) throw error;
      }

      toast.success('Dose salva com sucesso!');
      setEditando(null);
      onDoseUpdate();
    } catch (error) {
      console.error('Erro ao salvar dose:', error);
      toast.error('Erro ao salvar dose');
    } finally {
      setSalvando(false);
    }
  };

  const verificarAlerta = (paciente: PacienteComDose, dose: number) => {
    const tipoAcesso = paciente.acesso_vascular?.tipo as keyof typeof LIMITES_DOSE;
    if (!tipoAcesso || !LIMITES_DOSE[tipoAcesso]) return null;
    
    const limites = LIMITES_DOSE[tipoAcesso];
    if (dose < limites.min || dose > limites.max) {
      return 'danger';
    }
    return null;
  };

  const formatarTurno = (turno?: string) => {
    const turnos = {
      'manha': 'Manhã',
      'tarde': 'Tarde', 
      'noite': 'Noite'
    };
    return turnos[turno as keyof typeof turnos] || turno;
  };

  if (pacientes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Nenhum paciente encontrado com os filtros aplicados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pacientes.map((paciente) => {
        const estaEditando = editando?.pacienteId === paciente.id;
        const doseAtual = paciente.dose_heparina?.dose_heparina || 0;
        const alerta = verificarAlerta(paciente, doseAtual);
        
        return (
          <Card key={paciente.id} className={`transition-all ${
            alerta === 'danger' ? 'border-red-200 bg-red-50' : ''
          }`}>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Informações do Paciente */}
                <div className="lg:col-span-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">{paciente.nome}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span>Reg: {paciente.registro}</span>
                      {paciente.maquina_numero && (
                        <span>• Máq: {paciente.maquina_numero}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {paciente.cidade && (
                        <Badge variant="neutral" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {paciente.cidade}
                        </Badge>
                      )}
                      {paciente.sessao_atual && (
                        <Badge variant="neutral" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {paciente.sessao_atual?.turno ? formatarTurno(paciente.sessao_atual.turno as string) : ''}
                        </Badge>
                      )}
                      {paciente.acesso_vascular?.tipo && (
                        <Badge 
                          variant={paciente.acesso_vascular.tipo === 'FAV' ? 'default' : 'neutral'}
                          className="text-xs"
                        >
                          {paciente.acesso_vascular.tipo}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Doses */}
                <div className="lg:col-span-6">
                  {estaEditando ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Dose Heparina (UI)
                        </label>
                        <Input
                          type="number"
                          value={editando.doseHeparina}
                          onChange={(e) => setEditando({
                            ...editando,
                            doseHeparina: e.target.value
                          })}
                          placeholder="Ex: 5000"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Dose Cateter (UI)
                        </label>
                        <Input
                          type="number"
                          value={editando.doseCateter}
                          onChange={(e) => setEditando({
                            ...editando,
                            doseCateter: e.target.value
                          })}
                          placeholder="Ex: 2000"
                          className="text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Observações
                        </label>
                        <Textarea
                          value={editando.observacoes}
                          onChange={(e) => setEditando({
                            ...editando,
                            observacoes: e.target.value
                          })}
                          placeholder="Observações sobre a dose..."
                          className="text-sm"
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Dose Heparina
                        </label>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-semibold ${
                            alerta === 'danger' ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {doseAtual ? `${doseAtual.toLocaleString()} UI` : 'Não prescrita'}
                          </span>
                          {alerta === 'danger' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 block mb-1">
                          Dose Cateter
                        </label>
                        <span className="text-lg font-semibold text-gray-900">
                          {paciente.dose_heparina?.dose_cateter ? 
                            `${paciente.dose_heparina.dose_cateter.toLocaleString()} UI` : 
                            'Não prescrita'
                          }
                        </span>
                      </div>
                      {paciente.dose_heparina?.observacoes && (
                        <div className="sm:col-span-2">
                          <label className="text-xs font-medium text-gray-600 block mb-1">
                            Observações
                          </label>
                          <p className="text-sm text-gray-700">
                            {paciente.dose_heparina.observacoes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="lg:col-span-2">
                  {estaEditando ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={salvarDose}
                        disabled={salvando}
                        className="flex-1"
                      >
                        {salvando ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelarEdicao}
                        disabled={salvando}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => iniciarEdicao(paciente)}
                      className="w-full"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>

              {/* Alerta de dose fora dos limites */}
              {alerta === 'danger' && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Dose fora dos limites seguros para {paciente.acesso_vascular?.tipo}
                    </span>
                  </div>
                  {paciente.acesso_vascular?.tipo && LIMITES_DOSE[paciente.acesso_vascular.tipo as keyof typeof LIMITES_DOSE] && (
                    <p className="text-xs text-red-700 mt-1">
                      Limite recomendado: {LIMITES_DOSE[paciente.acesso_vascular.tipo as keyof typeof LIMITES_DOSE].min.toLocaleString()} - {LIMITES_DOSE[paciente.acesso_vascular.tipo as keyof typeof LIMITES_DOSE].max.toLocaleString()} UI
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}