'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Building,
  Clock,
  Settings,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FormularioEscala from './FormularioEscala';

interface Paciente {
  id: string;
  nome: string;
  registro: string;
  telefone?: string;
}

interface Sala {
  id: string;
  nome: string;
  descricao: string;
}

interface Turno {
  id: string;
  nome: string;
  hora_inicio: string;
  hora_fim: string;
}

interface Maquina {
  id: string;
  numero: string;
  sala_id: string;
  status: boolean;
  modelo?: string;
}

interface EscalaPaciente {
  id: string;
  paciente_id: string;
  sala_id: string;
  turno_id: string;
  maquina_id: string;
  dias_semana: string[];
  observacao?: string;
  paciente: Paciente;
  sala: Sala;
  turno: Turno;
  maquina: Maquina;
}

const DIAS_SEMANA = [
  { value: '1', label: 'Segunda' },
  { value: '2', label: 'Terça' },
  { value: '3', label: 'Quarta' },
  { value: '4', label: 'Quinta' },
  { value: '5', label: 'Sexta' },
  { value: '6', label: 'Sábado' },
  { value: '0', label: 'Domingo' }
];

export default function EscalaPacientes() {
  const [escala, setEscala] = useState<EscalaPaciente[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<EscalaPaciente | null>(null);
  const { clinicId } = useAuth();
  
  // Filtros
  const [filtroSala, setFiltroSala] = useState('');
  const [filtroTurno, setFiltroTurno] = useState('');
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [filtroData, setFiltroData] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (clinicId) {
      carregarDados();
    }
  }, [clinicId]);

  const supabase = createClient();

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      if (!clinicId) {
        toast.error('Erro: Usuário não possui clínica associada');
        return;
      }
      
      // Carregar dados em paralelo
      const [pacientesRes, salasRes, turnosRes, maquinasRes, escalaRes] = await Promise.all([
        supabase.from('pacientes').select('id, nome_completo, registro, telefone').eq('clinica_id', clinicId).order('nome_completo'),
        supabase.from('salas').select('id, nome, descricao').eq('clinica_id', clinicId).order('nome'),
        supabase.from('turnos').select('id, nome, hora_inicio, hora_fim').eq('clinica_id', clinicId).order('hora_inicio'),
        supabase.from('maquinas').select('id, identificador, modelo, ativa, sala_id').eq('clinica_id', clinicId).order('identificador'),
        supabase
          .from('escala_pacientes')
          .select(`
            id,
            paciente_id,
            sala_id,
            turno_id,
            maquina_id,
            dias_semana,
            observacao,
            paciente:pacientes!inner(id, nome_completo, registro, telefone),
            sala:salas!inner(id, nome, descricao),
            turno:turnos!inner(id, nome, hora_inicio, hora_fim),
            maquina:maquinas!inner(id, identificador, modelo, ativa, sala_id)
          `)
          .eq('clinica_id', clinicId)
          .order('created_at', { ascending: false })
      ]);

      if (pacientesRes.error) throw pacientesRes.error;
      if (salasRes.error) throw salasRes.error;
      if (turnosRes.error) throw turnosRes.error;
      if (maquinasRes.error) throw maquinasRes.error;
      if (escalaRes.error) throw escalaRes.error;

      // Mapear dados para as interfaces corretas
      const pacientesMapeados = (pacientesRes.data || []).map((p: any) => ({
        id: p.id,
        nome: p.nome_completo,
        registro: p.registro,
        telefone: p.telefone
      }));
      
      const maquinasMapeadas = (maquinasRes.data || []).map((m: any) => ({
        id: m.id,
        numero: m.identificador,
        sala_id: m.sala_id,
        status: m.ativa,
        modelo: m.modelo
      }));
      
      const escalaMapeada = (escalaRes.data || []).map((e: any) => ({
        ...e,
        paciente: {
          id: e.paciente.id,
          nome: e.paciente.nome_completo,
          registro: e.paciente.registro,
          telefone: e.paciente.telefone
        },
        maquina: {
          id: e.maquina.id,
          numero: e.maquina.identificador,
          sala_id: e.maquina.sala_id,
          status: e.maquina.ativa,
          modelo: e.maquina.modelo
        }
      }));
      
      setPacientes(pacientesMapeados);
      setSalas(salasRes.data || []);
      setTurnos(turnosRes.data || []);
      setMaquinas(maquinasMapeadas);
      setEscala(escalaMapeada);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da escala');
    } finally {
      setLoading(false);
    }
  };

  const escalaFiltrada = escala.filter(item => {
    const matchSala = !filtroSala || item.sala_id === filtroSala;
    const matchTurno = !filtroTurno || item.turno_id === filtroTurno;
    const matchPaciente = !filtroPaciente || 
      item.paciente.nome.toLowerCase().includes(filtroPaciente.toLowerCase()) ||
      item.paciente.registro.toLowerCase().includes(filtroPaciente.toLowerCase());
    
    // Verificar se o paciente tem sessão no dia filtrado
    const diaSemana = new Date(filtroData).getDay().toString();
    const matchData = item.dias_semana.includes(diaSemana);
    
    return matchSala && matchTurno && matchPaciente && matchData;
  });

  const escalaOrganizada = salas.reduce((acc, sala) => {
    acc[sala.id] = {
      sala,
      turnos: turnos.map(turno => ({
        turno,
        pacientes: escalaFiltrada.filter(item => 
          item.sala_id === sala.id && item.turno_id === turno.id
        )
      }))
    };
    return acc;
  }, {} as Record<string, any>);

  const verificarConflitos = (pacienteId: string, turnoId: string, excludeId?: string) => {
    return escala.some(item => 
      item.id !== excludeId &&
      item.paciente_id === pacienteId && 
      item.turno_id === turnoId
    );
  };

  const getDiaSemanaNome = (dia: string) => {
    return DIAS_SEMANA.find(d => d.value === dia)?.label || dia;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal do Formulário */}
      <FormularioEscala
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
        onSave={() => {
          carregarDados();
          setShowModal(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        pacientes={pacientes}
        salas={salas}
        turnos={turnos}
        maquinas={maquinas}
      />
      
      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <Input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sala
            </label>
            <Select
              options={[
                { value: '', label: 'Todas as salas' },
                ...salas.map(sala => ({
                  value: sala.id,
                  label: sala.nome
                }))
              ]}
              value={filtroSala}
              onChange={(value: string) => setFiltroSala(value)}
              placeholder="Filtrar por sala"
            />
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Turno
            </label>
            <Select
              options={[
                { value: '', label: 'Todos os turnos' },
                ...turnos.map(turno => ({
                  value: turno.id,
                  label: `${turno.nome} (${turno.hora_inicio} - ${turno.hora_fim})`
                }))
              ]}
              value={filtroTurno}
              onChange={(value: string) => setFiltroTurno(value)}
              placeholder="Filtrar por turno"
            />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Paciente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar paciente..."
                value={filtroPaciente}
                onChange={(e) => setFiltroPaciente(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>
      </Card>

      {/* Grid da Escala */}
      <div className="space-y-6">
        {Object.values(escalaOrganizada).map((salaData: any) => (
          <Card key={salaData.sala.id} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {salaData.sala.nome}
              </h3>
              <Badge variant="neutral">
                Descrição: {salaData.sala.descricao}
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {salaData.turnos.map((turnoData: any) => (
                <div key={turnoData.turno.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {turnoData.turno.nome}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {turnoData.turno.hora_inicio} - {turnoData.turno.hora_fim}
                    </span>
                    <Badge variant={turnoData.pacientes.length > 0 ? "default" : "neutral"}>
                      {turnoData.pacientes.length} pacientes
                    </Badge>
                  </div>
                  
                  {turnoData.pacientes.length > 0 ? (
                    <div className="grid gap-2">
                      {turnoData.pacientes.map((item: EscalaPaciente) => {
                        const temConflito = verificarConflitos(item.paciente_id, item.turno_id, item.id);
                        
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              temConflito 
                                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {temConflito && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {item.paciente.nome}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Reg: {item.paciente.registro} | Máq: {item.maquina.numero}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Dias: {item.dias_semana.map(dia => getDiaSemanaNome(dia)).join(', ')}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum paciente agendado para este turno</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      
      {escalaFiltrada.length === 0 && (
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum agendamento encontrado</h3>
            <p>Não há pacientes agendados para os filtros selecionados.</p>
          </div>
        </Card>
      )}
    </div>
  );
}