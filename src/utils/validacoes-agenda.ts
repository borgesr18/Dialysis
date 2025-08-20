import { format, isAfter, isBefore, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AgendamentoSessao, StatusAgendamento } from '@/shared/types';

export interface ErroValidacao {
  campo: string;
  mensagem: string;
}

export interface ResultadoValidacao {
  valido: boolean;
  erros: ErroValidacao[];
}

/**
 * Valida os dados de um agendamento
 */
export const validarAgendamento = (
  dados: Partial<AgendamentoSessao>
): ResultadoValidacao => {
  const erros: ErroValidacao[] = [];

  // Validar paciente
  if (!dados.paciente_id) {
    erros.push({
      campo: 'paciente_id',
      mensagem: 'Paciente é obrigatório'
    });
  }

  // Validar máquina
  if (!dados.maquina_id) {
    erros.push({
      campo: 'maquina_id',
      mensagem: 'Máquina é obrigatória'
    });
  }

  // Validar turno
  if (!dados.turno_id) {
    erros.push({
      campo: 'turno_id',
      mensagem: 'Turno é obrigatório'
    });
  }

  // Validar data
  if (!dados.data_agendamento) {
    erros.push({
      campo: 'data_agendamento',
      mensagem: 'Data da sessão é obrigatória'
    });
  } else {
    const dataSessao = typeof dados.data_agendamento === 'string' 
      ? parseISO(dados.data_agendamento) 
      : dados.data_agendamento;
    
    // Não permitir agendamentos no passado (exceto hoje)
    if (isBefore(dataSessao, new Date()) && !isToday(dataSessao)) {
      erros.push({
        campo: 'data_agendamento',
        mensagem: 'Não é possível agendar sessões em datas passadas'
      });
    }

    // Não permitir agendamentos muito no futuro (6 meses)
    const seiseMesesFuturo = new Date();
    seiseMesesFuturo.setMonth(seiseMesesFuturo.getMonth() + 6);
    
    if (isAfter(dataSessao, seiseMesesFuturo)) {
      erros.push({
        campo: 'data_agendamento',
        mensagem: 'Não é possível agendar sessões com mais de 6 meses de antecedência'
      });
    }
  }

  // Validar horário
  if (!dados.hora_inicio) {
    erros.push({
      campo: 'hora_inicio',
      mensagem: 'Horário de início é obrigatório'
    });
  }

  if (!dados.hora_fim) {
    erros.push({
      campo: 'hora_fim',
      mensagem: 'Horário de fim é obrigatório'
    });
  }

  // Validar se horário de fim é após horário de início
  if (dados.hora_inicio && dados.hora_fim) {
    if (dados.hora_fim <= dados.hora_inicio) {
      erros.push({
        campo: 'hora_fim',
        mensagem: 'Horário de fim deve ser posterior ao horário de início'
      });
    }
  }

  // Validar duração mínima (1 hora)
  if (dados.hora_inicio && dados.hora_fim) {
    const inicio = new Date(`2000-01-01T${dados.hora_inicio}`);
    const fim = new Date(`2000-01-01T${dados.hora_fim}`);
    const duracaoMinutos = (fim.getTime() - inicio.getTime()) / (1000 * 60);
    
    if (duracaoMinutos < 60) {
      erros.push({
        campo: 'hora_fim',
        mensagem: 'Duração mínima da sessão é de 1 hora'
      });
    }

    // Validar duração máxima (6 horas)
    if (duracaoMinutos > 360) {
      erros.push({
        campo: 'hora_fim',
        mensagem: 'Duração máxima da sessão é de 6 horas'
      });
    }
  }

  // Validar observações (máximo 500 caracteres)
  if (dados.observacoes && dados.observacoes.length > 500) {
    erros.push({
      campo: 'observacoes',
      mensagem: 'Observações não podem exceder 500 caracteres'
    });
  }

  return {
    valido: erros.length === 0,
    erros
  };
};

/**
 * Valida se um agendamento pode ser cancelado
 */
export const validarCancelamento = (
  agendamento: AgendamentoSessao
): ResultadoValidacao => {
  const erros: ErroValidacao[] = [];

  // Verificar se já está cancelado
  if (agendamento.status === 'cancelado') {
    erros.push({
      campo: 'status',
      mensagem: 'Agendamento já está cancelado'
    });
  }

  // Verificar se já foi realizado
  if (agendamento.status === 'concluido') {
    erros.push({
      campo: 'status',
      mensagem: 'Não é possível cancelar uma sessão já realizada'
    });
  }

  // Verificar se está em andamento
  if (agendamento.status === 'em_andamento') {
    erros.push({
      campo: 'status',
      mensagem: 'Não é possível cancelar uma sessão em andamento'
    });
  }

  return {
    valido: erros.length === 0,
    erros
  };
};

/**
 * Valida se um agendamento pode ser editado
 */
export const validarEdicao = (
  agendamento: AgendamentoSessao
): ResultadoValidacao => {
  const erros: ErroValidacao[] = [];

  // Verificar se já foi realizado
  if (agendamento.status === 'concluido') {
    erros.push({
      campo: 'status',
      mensagem: 'Não é possível editar uma sessão já realizada'
    });
  }

  // Verificar se está cancelado
  if (agendamento.status === 'cancelado') {
    erros.push({
      campo: 'status',
      mensagem: 'Não é possível editar uma sessão cancelada'
    });
  }

  // Verificar se está em andamento
  if (agendamento.status === 'em_andamento') {
    erros.push({
      campo: 'status',
      mensagem: 'Não é possível editar uma sessão em andamento'
    });
  }

  return {
    valido: erros.length === 0,
    erros
  };
};

/**
 * Valida conflitos de horário
 */
export const validarConflitosHorario = (
  novoAgendamento: Partial<AgendamentoSessao>,
  agendamentosExistentes: AgendamentoSessao[],
  agendamentoEditando?: AgendamentoSessao
): ResultadoValidacao => {
  const erros: ErroValidacao[] = [];

  if (!novoAgendamento.data_agendamento || !novoAgendamento.hora_inicio || !novoAgendamento.hora_fim) {
    return { valido: true, erros: [] };
  }

  const dataStr = typeof novoAgendamento.data_agendamento === 'string' 
    ? novoAgendamento.data_agendamento 
    : format(novoAgendamento.data_agendamento, 'yyyy-MM-dd');

  // Filtrar agendamentos do mesmo dia e que não estão cancelados
  const agendamentosMesmoDia = agendamentosExistentes.filter(a => {
    const dataAgendamento = typeof a.data_agendamento === 'string' 
      ? a.data_agendamento 
      : format(a.data_agendamento, 'yyyy-MM-dd');
    
    return dataAgendamento === dataStr && 
           a.status !== 'cancelado' &&
           (!agendamentoEditando || a.id !== agendamentoEditando.id);
  });

  // Verificar conflito de paciente
  if (novoAgendamento.paciente_id) {
    const conflitoPaciente = agendamentosMesmoDia.find(a => {
      if (a.paciente_id !== novoAgendamento.paciente_id) return false;
      
      return verificarSobreposicaoHorario(
        novoAgendamento.hora_inicio!,
        novoAgendamento.hora_fim!,
        a.hora_inicio,
        a.hora_fim || '23:59'
      );
    });

    if (conflitoPaciente) {
      erros.push({
        campo: 'paciente_id',
        mensagem: `Paciente já tem agendamento das ${conflitoPaciente.hora_inicio} às ${conflitoPaciente.hora_fim}`
      });
    }
  }

  // Verificar conflito de máquina
  if (novoAgendamento.maquina_id) {
    const conflitoMaquina = agendamentosMesmoDia.find(a => {
      if (a.maquina_id !== novoAgendamento.maquina_id) return false;
      
      return verificarSobreposicaoHorario(
        novoAgendamento.hora_inicio!,
        novoAgendamento.hora_fim!,
        a.hora_inicio,
        a.hora_fim || '23:59'
      );
    });

    if (conflitoMaquina) {
      erros.push({
        campo: 'maquina_id',
        mensagem: `Máquina já está ocupada das ${conflitoMaquina.hora_inicio} às ${conflitoMaquina.hora_fim}`
      });
    }
  }

  return {
    valido: erros.length === 0,
    erros
  };
};

/**
 * Verifica se dois horários se sobrepõem
 */
const verificarSobreposicaoHorario = (
  inicio1: string,
  fim1: string,
  inicio2: string,
  fim2: string
): boolean => {
  const start1 = new Date(`2000-01-01T${inicio1}`);
  const end1 = new Date(`2000-01-01T${fim1}`);
  const start2 = new Date(`2000-01-01T${inicio2}`);
  const end2 = new Date(`2000-01-01T${fim2}`);

  return start1 < end2 && start2 < end1;
};

/**
 * Formata erros de validação para exibição
 */
export const formatarErrosValidacao = (erros: ErroValidacao[]): string => {
  if (erros.length === 0) return '';
  
  if (erros.length === 1) {
    return erros[0].mensagem;
  }
  
  return erros.map((erro, index) => `${index + 1}. ${erro.mensagem}`).join('\n');
};

/**
 * Valida filtros de agenda
 */
export const validarFiltros = (filtros: any): ResultadoValidacao => {
  const erros: ErroValidacao[] = [];

  // Validar datas
  if (filtros.dataInicio && filtros.dataFim) {
    const inicio = typeof filtros.dataInicio === 'string' 
      ? parseISO(filtros.dataInicio) 
      : filtros.dataInicio;
    const fim = typeof filtros.dataFim === 'string' 
      ? parseISO(filtros.dataFim) 
      : filtros.dataFim;

    if (isAfter(inicio, fim)) {
      erros.push({
        campo: 'dataFim',
        mensagem: 'Data de fim deve ser posterior à data de início'
      });
    }

    // Validar período máximo (1 ano)
    const umAnoFuturo = new Date(inicio);
    umAnoFuturo.setFullYear(umAnoFuturo.getFullYear() + 1);
    
    if (isAfter(fim, umAnoFuturo)) {
      erros.push({
        campo: 'dataFim',
        mensagem: 'Período máximo de filtro é de 1 ano'
      });
    }
  }

  // Validar texto de busca
  if (filtros.buscarTexto && filtros.buscarTexto.length > 100) {
    erros.push({
      campo: 'buscarTexto',
      mensagem: 'Texto de busca não pode exceder 100 caracteres'
    });
  }

  return {
    valido: erros.length === 0,
    erros
  };
};