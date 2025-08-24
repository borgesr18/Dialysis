'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { updateClinicConfig } from './_actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ToastContainer, useToast } from '@/components/ui/Toast';
import { Building2, Hash, Mail, Phone, MapPin, Globe, Clock, FileText, ArrowLeft, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';

interface Clinica {
  id: string;
  nome: string;
  cnpj?: string;
  email?: string;
  endereco?: string;
  telefone?: string;
  uf?: string;
  fuso_horario?: string;
  observacoes?: string;
}

export default function AdminConfigPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [loadingClinica, setLoadingClinica] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    uf: 'PE',
    fuso_horario: 'America/Recife',
    observacoes: ''
  });
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Carregar dados da clínica
  useEffect(() => {
    if (!isMounted) return;
    
    async function loadClinica() {
      try {
        const supabase = createClient();
        
        // Obter usuário autenticado
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          showError('Usuário não autenticado');
          return;
        }

        // Obter clínica do usuário
        const { data: usuarioClinica, error: clinicaError } = await supabase
          .from('usuarios_clinicas')
          .select('clinica_id')
          .eq('user_id', user.id)
          .single();

        if (clinicaError || !usuarioClinica) {
          showError('Erro ao obter clínica do usuário');
          return;
        }
        
        const { data, error } = await supabase
          .from('clinicas')
          .select('*')
          .eq('id', usuarioClinica.clinica_id)
          .single();

        if (error) {
          console.error('Erro ao carregar clínica:', error);
          showError('Erro ao carregar dados da clínica');
          return;
        }

        setClinica(data);
        setFormData({
          nome: data?.nome || '',
          cnpj: data?.cnpj || '',
          email: data?.email || '',
          telefone: data?.telefone || '',
          endereco: data?.endereco || '',
          uf: data?.uf || 'PE',
          fuso_horario: data?.fuso_horario || 'America/Recife',
          observacoes: data?.observacoes || ''
        });
      } catch (error) {
        console.error('Erro ao carregar clínica:', error);
        showError('Erro ao carregar dados da clínica');
      } finally {
        setLoadingClinica(false);
      }
    }

    loadClinica();
  }, [isMounted]);

  // Verificar mensagens de sucesso/erro na URL
  useEffect(() => {
    const ok = searchParams.get('ok');
    const error = searchParams.get('error');
    
    if (ok) {
      showSuccess(ok);
    }
    if (error) {
      showError(error);
    }
  }, [searchParams, showSuccess, showError]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formDataObj = new FormData(e.currentTarget);
      
      // Validação básica
      const nome = formDataObj.get('nome') as string;
      const email = formDataObj.get('email') as string;
      
      const newErrors: Record<string, string> = {};
      
      if (!nome?.trim()) {
        newErrors.nome = 'Nome da clínica é obrigatório';
      }
      
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Email inválido';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      await updateClinicConfig(formDataObj);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setErrors({ geral: 'Erro interno do servidor' });
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setIsModalOpen(false);
    router.push('/dashboard');
  };

  const formContent = (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary-600" />
          Configurações da Clínica
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid de informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome da clínica */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Nome da clínica
              </Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Clínica Modelo"
                error={errors.nome}
                required
              />
            </div>

            {/* CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                CNPJ
              </Label>
              <Input
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
                error={errors.cnpj}
              />
            </div>
          </div>

          {/* Grid de contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@clinica.com.br"
                error={errors.email}
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="telefone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefone
              </Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(81) 99999-9999"
                error={errors.telefone}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço
            </Label>
            <Input
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua, número, bairro"
              error={errors.endereco}
            />
          </div>

          {/* Grid de localização e configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UF */}
            <div className="space-y-2">
              <Label htmlFor="uf" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                UF
              </Label>
              <Input
                id="uf"
                name="uf"
                value={formData.uf}
                onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                placeholder="PE"
                maxLength={2}
                error={errors.uf}
              />
            </div>

            {/* Fuso horário */}
            <div className="space-y-2">
              <Label htmlFor="fuso_horario" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Fuso horário
              </Label>
              <select
                id="fuso_horario"
                name="fuso_horario"
                value={formData.fuso_horario}
                onChange={(e) => setFormData(prev => ({ ...prev, fuso_horario: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Padrão do servidor</option>
                <option value="America/Recife">America/Recife (GMT-3, sem DST)</option>
                <option value="America/Sao_Paulo">America/Sao_Paulo (GMT-3)</option>
              </select>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </Label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
              placeholder="Anotações internas sobre a clínica"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Erro geral */}
          {errors.geral && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-800 text-sm font-medium">
                {errors.geral}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || loadingClinica}
            >
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações da Clínica
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isMounted && (
          <Modal isOpen={isModalOpen} onClose={handleClose} size="xl">
            {formContent}
          </Modal>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
