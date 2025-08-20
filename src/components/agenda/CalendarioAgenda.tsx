'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pt-br';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Monitor,
} from 'lucide-react';
import {
  EventoCalendario,
  TipoVisualizacaoCalendario,
  StatusAgendamento,
  AgendamentoSessao,
} from '@/shared/types';
import { cn } from '@/lib/utils';

// Configurar moment para português
moment.locale('pt-br');
const localizer = momentLocalizer(moment);

interface CalendarioAgendaProps {
  eventos: EventoCalendario[];
  agendamentos: AgendamentoSessao[];
  onEventoClick?: (evento: EventoCalendario) => void;
  onSlotClick?: (slotInfo: { start: Date; end: Date }) => void;
  onVisualizacaoChange?: (view: TipoVisualizacaoCalendario) => void;
  visualizacao?: TipoVisualizacaoCalendario;
  loading?: boolean;
}

const statusColors: Record<StatusAgendamento, string> = {
  agendado: 'bg-blue-500',
  confirmado: 'bg-green-500',
  em_andamento: 'bg-yellow-500',
  concluido: 'bg-emerald-500',
  cancelado: 'bg-red-500',
  faltou: 'bg-gray-500',
};

const statusLabels: Record<StatusAgendamento, string> = {
  agendado: 'Agendado',
  confirmado: 'Confirmado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
};

const viewLabels: Record<View, string> = {
  month: 'Mês',
  week: 'Semana',
  work_week: 'Semana de Trabalho',
  day: 'Dia',
  agenda: 'Agenda',
};

export function CalendarioAgenda({
  eventos,
  agendamentos,
  onEventoClick,
  onSlotClick,
  onVisualizacaoChange,
  visualizacao = 'mensal' as TipoVisualizacaoCalendario,
  loading = false,
}: CalendarioAgendaProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(
    (visualizacao as string) === 'mensal' ? 'month' : (visualizacao as string) === 'semanal' ? 'week' : 'day'
  );
  const [isClient, setIsClient] = useState(false);

  // Evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Converter agendamentos para eventos do calendário
  const eventosCalendario = useMemo(() => {
    return agendamentos.map((agendamento) => ({
      id: agendamento.id,
      title: `${agendamento.pacientes?.nome_completo || 'Paciente'} - Máquina ${agendamento.maquinas?.identificador || 'N/A'}`,
      start: new Date(`${agendamento.data_agendamento}T${agendamento.hora_inicio}`),
      end: new Date(`${agendamento.data_agendamento}T${agendamento.hora_fim}`),
      resource: {
        paciente_id: agendamento.paciente_id,
        maquina_id: agendamento.maquina_id,
        status: agendamento.status,
        tipo: 'sessao' as const,
        agendamento,
      },
    }));
  }, [agendamentos]);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback(
    (view: View) => {
      setCurrentView(view);
      const tipoView = view === 'month' ? 'mensal' : view === 'week' ? 'semanal' : 'diaria';
      onVisualizacaoChange?.(tipoView as TipoVisualizacaoCalendario);
    },
    [onVisualizacaoChange]
  );

  const handleSelectEvent = useCallback(
    (event: any) => {
      onEventoClick?.(event);
    },
    [onEventoClick]
  );

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date }) => {
      onSlotClick?.(slotInfo);
    },
    [onSlotClick]
  );

  // Componente customizado para eventos
  const EventComponent = ({ event }: { event: any }) => {
    const status = event.resource?.status as StatusAgendamento;
    return (
      <div className={cn('p-1 rounded text-white text-xs', statusColors[status] || 'bg-gray-500')}>
        <div className="font-medium truncate">{event.title}</div>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3" />
          <span>
            {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
          </span>
        </div>
      </div>
    );
  };

  // Toolbar customizada
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('PREV')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('TODAY')}
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('NEXT')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold">{label}</h2>

        <div className="flex items-center gap-2">
          <Select
            value={currentView}
            onChange={(value) => onView(value as View)}
            options={[
              { value: 'month', label: 'Mês' },
              { value: 'week', label: 'Semana' },
              { value: 'day', label: 'Dia' },
            ]}
            className="w-32"
          />
        </div>
      </div>
    );
  };

  if (loading || !isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Agenda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Agenda de Sessões
        </CardTitle>
        
        {/* Legenda de status */}
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(statusLabels).map(([status, label]) => (
            <Badge
              key={status}
              variant="default"
              className={cn('text-white', statusColors[status as StatusAgendamento])}
            >
              {label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={eventosCalendario}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            view={currentView}
            date={currentDate}
            components={{
              event: EventComponent,
              toolbar: CustomToolbar,
            }}
            messages={{
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
              date: 'Data',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'Não há eventos neste período',
              showMore: (total) => `+ Ver mais (${total})`,
            }}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              dayHeaderFormat: 'dddd, DD/MM',
              dayRangeHeaderFormat: ({ start, end }) =>
                `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM')}`,
              monthHeaderFormat: 'MMMM YYYY',
            }}
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 6, 0)} // 06:00
            max={new Date(2024, 0, 1, 22, 0)} // 22:00
          />
        </div>
      </CardContent>
    </Card>
  );
}