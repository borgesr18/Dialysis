'use client';

import { useState, useEffect } from 'react';
import { Edit2, Save, X, AlertTriangle, Filter, Calendar, Users, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabase } from '@/hooks/useSupabase';
import { Database } from '@/types/database';
import { toast } from 'sonner';

type Paciente = Database['public']['Tables']['pacientes']['Row'];
type DoseHeparina = Database['public']['Tables']['doses_heparina']['Row'];
type Sala = Database['public']['Tables']['salas']['Row'];
type Turno = Database['public']['Tables']['turnos']['Row'];
type EscalaPaciente = Database['public']['Tables']['escala_pacientes']['Row'];
type AcessoVascular = Database['public']['Tables']['acessos_vasculares']['Row'];

interface PacienteLancamento extends Paciente {
  dose_heparina?: DoseHeparina;
  acesso_vascular?: AcessoVascular;
  maquina_numero?: number;
  sala_nome?: string;
  turno_nome?: string;
  cidade?: string;
}

interface DoseEditando {
  pacienteId: string;
  doseHeparina: string;
  doseCateter: string;
  observacoes: string;
}

interface SalaTurno {
  sala: Sala;
  turno: Turno;
  pacientes: PacienteLancamento[];
}

// Limites de dose baseados no tipo de acesso
const LIMITES_DOSE = {
  FAV: { min: 5000, max: 10000 },
  CDL: { min: 1000, max: 5000 },
  PC: { min: 1000, max: 5000 }
};

export default function LancamentoHeparina() {
  const { supabase } = useSupabase();
  const [salasTurnos, setSalasTurnos] = useState<SalaTurno[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<DoseEditando | null>(null);
  const [salvando, setSalvando] = useState(false);
  
  // Filtros
  const [filtroSala, setFiltroSala] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');
  const [filtroData, setFiltroData] = useState(new Date().toISOString().split('T')[0]);
  const [filtroPaciente, setFiltroPaciente] = useState('');

  useEffect(() => {
    carregarDados();
  }, [filtroSala, filtroTurno, filtroData]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar salas
      const { data: salasData } = await supabase
        .from('salas')
        .select('*')
        .eq('ativa', true)
        .order('nome');
      
      // Carregar turnos
      const { data: turnosData } = await supabase
        .from('turnos')
        .select('*')
        .eq('ativo', true)
        .order('hora_inicio');
      
      setSalas(salasData || []);
      setTurnos(turnosData || []);
      
      // Carregar pacientes agendados para a data selecionada
      await carregarPacientesAgendados();
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const carregarPacientesAgendados = async () => {
    try {
      let query = supabase
        .from('escala_pacientes')
        .select(`
          *,
          paciente:pacientes!inner(
            id,
            nome,
            registro,
            cidade,
            clinica_id
          ),
          sala:salas!inner(
            id,
            nome
          ),
          turno:turnos!inner(
            id,
            nome,
            hora_inicio,
            hora_fim
          ),
          maquina:maquinas(
            numero
          )
        `)
        .eq('data_agendamento', filtroData)
        .eq('status', 'agendado');
      
      if (filtroSala) {
        query = query.eq('sala_id', filtroSala);
      }
      
      if (filtroTurno) {
        query = query.eq('turno_id', filtroTurno);
      }
      
      const { data: escalasData } = await query.order('sala_id').order('turno_id');
      
      if (!escalasData) {
        setSalasTurnos([]);
        return;
      }
      
      // Carregar doses de heparina e acessos vasculares para os pacientes
      const pacienteIds = escalasData.map(e => e.paciente_id);
      
      const { data: dosesData } = await supabase
        .from('doses_heparina')
        .select('*')
        .in('paciente_id', pacienteIds)
        .gte('data_prescricao', filtroData)
        .lt('data_prescricao', new Date(new Date(filtroData).getTime() + 24 * 60 * 60 * 1000).toISOString());
      
      const { data: acessosData } = await supabase
        .from('acessos_vasculares')
        .select('*')
        .in('paciente_id', pacienteIds)
        .eq('ativo', true);
      
      // Organizar dados por sala e turno
      const salasTurnosMap = new Map<string, SalaTurno>();
      
      escalasData.forEach((escala: any) => {
        const chave = `${escala.sala.id}-${escala.turno.id}`;
        
        if (!salasTurnosMap.has(chave)) {
          salasTurnosMap.set(chave, {
            sala: escala.sala,
            turno: escala.turno,
            pacientes: []
          });
        }
        
        const dose = dosesData?.find(d => d.paciente_id === escala.paciente_id);
        const acesso = acessosData?.find(a => a.paciente_id === escala.paciente_id);
        
        const pacienteLancamento: PacienteLancamento = {
          ...escala.paciente,
          dose_heparina: dose,
          acesso_vascular: acesso,
          maquina_numero: escala.maquina?.numero,
          sala_nome: escala.sala.nome,
          turno_nome: escala.turno.nome
        };
        
        salasTurnosMap.get(chave)!.pacientes.push(pacienteLancamento);
      });
      
      // Filtrar por nome do paciente se especificado
      let salasTurnosArray = Array.from(salasTurnosMap.values());
      
      if (filtroPaciente) {
        salasTurnosArray = salasTurnosArray.map(st => ({
          ...st,
          pacientes: st.pacientes.filter(p => 
            p.nome_completo?.toLowerCase().includes(filtroPaciente.toLowerCase()) ||
            p.registro?.toLowerCase().includes(filtroPaciente.toLowerCase())
          )
        })).filter(st => st.pacientes.length > 0);
      }
      
      setSalasTurnos(salasTurnosArray);
      
    } catch (error) {
      console.error('Erro ao carregar pacientes agendados:', error);
      toast.error('Erro ao carregar pacientes agendados');
    }
  };

  const iniciarEdicao = (paciente: PacienteLancamento) => {
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
      
      const paciente = salasTurnos
        .flatMap(st => st.pacientes)
        .find(p => p.id === editando.pacienteId);
      
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
      await carregarPacientesAgendados();
    } catch (error) {
      console.error('Erro ao salvar dose:', error);
      toast.error('Erro ao salvar dose');
    } finally {
      setSalvando(false);
    }
  };

  const verificarAlerta = (paciente: PacienteLancamento, dose: number) => {
    const tipoAcesso = paciente.acesso_vascular?.tipo as keyof typeof LIMITES_DOSE;
    if (!tipoAcesso || !LIMITES_DOSE[tipoAcesso]) return null;
    
    const limites = LIMITES_DOSE[tipoAcesso];
    if (dose < limites.min || dose > limites.max) {
      return 'danger';
    }
    return null;
  };

  const formatarTurno = (turno: Turno) => {
    return `${turno.nome} (${turno.hora_inicio} - ${turno.hora_fim})`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros de Lançamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data
              </label>
              <Input
                type="date"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Sala
              </label>
              <Select
                value={filtroSala}
                onChange={setFiltroSala}
                options={[
                  { value: '', label: 'Todas as salas' },
                  ...salas.map(sala => ({ value: sala.id, label: sala.nome }))
                ]}
                placeholder="Selecione uma sala"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Turno
              </label>
              <Select
                value={filtroTurno}
                onChange={setFiltroTurno}
                options={[
                  { value: '', label: 'Todos os turnos' },
                  ...turnos.map(turno => ({ value: turno.id, label: formatarTurno(turno) }))
                ]}
                placeholder="Selecione um turno"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Paciente
              </label>
              <Input
                type="text"
                value={filtroPaciente}
                onChange={(e) => setFiltroPaciente(e.target.value)}
                placeholder="Nome ou registro"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Salas e Turnos */}
      {salasTurnos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhum paciente agendado encontrado para os filtros selecionados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {salasTurnos.map((salaTurno) => (
            <Card key={`${salaTurno.sala.id}-${salaTurno.turno.id}`}>
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {salaTurno.sala.nome}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatarTurno(salaTurno.turno)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="neutral">
                    {salaTurno.pacientes.length} pacientes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          MAQ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Nome do Paciente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          REG
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          HEP
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          HEP_CATETER
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ACESSO
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          CIDADE
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          OBS
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {salaTurno.pacientes.map((paciente) => {
                        const estaEditando = editando?.pacienteId === paciente.id;
                        const doseAtual = paciente.dose_heparina?.dose_heparina || 0;
                        const alerta = verificarAlerta(paciente, doseAtual);
                        
                        return (
                          <tr key={paciente.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            alerta === 'danger' ? 'bg-red-50 dark:bg-red-900/20' : ''
                          }`}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {paciente.maquina_numero || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {paciente.nome_completo}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {paciente.registro}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {estaEditando ? (
                                <Input
                                  type="number"
                                  value={editando.doseHeparina}
                                  onChange={(e) => setEditando({
                                    ...editando,
                                    doseHeparina: e.target.value
                                  })}
                                  placeholder="Ex: 5000"
                                  className="w-24 text-sm"
                                />
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <span className={`text-sm font-medium ${
                                    alerta === 'danger' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {doseAtual ? doseAtual.toLocaleString() : '-'}
                                  </span>
                                  {alerta === 'danger' && (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {estaEditando ? (
                                <Input
                                  type="number"
                                  value={editando.doseCateter}
                                  onChange={(e) => setEditando({
                                    ...editando,
                                    doseCateter: e.target.value
                                  })}
                                  placeholder="Ex: 2000"
                                  className="w-24 text-sm"
                                />
                              ) : (
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {paciente.dose_heparina?.dose_cateter ? 
                                    paciente.dose_heparina.dose_cateter.toLocaleString() : 
                                    '-'
                                  }
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge 
                                variant={paciente.acesso_vascular?.tipo === 'FAV' ? 'default' : 'neutral'}
                                className="text-xs"
                              >
                                {paciente.acesso_vascular?.tipo || 'N/A'}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {paciente.cidade || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-32 truncate">
                              {estaEditando ? (
                                <Input
                                  type="text"
                                  value={editando.observacoes}
                                  onChange={(e) => setEditando({
                                    ...editando,
                                    observacoes: e.target.value
                                  })}
                                  placeholder="Observações"
                                  className="w-32 text-sm"
                                />
                              ) : (
                                paciente.dose_heparina?.observacoes || '-'
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              {estaEditando ? (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={salvarDose}
                                    disabled={salvando}
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
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}