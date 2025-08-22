'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { AlertTriangle, Home, RefreshCw, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const ERROR_MESSAGES = {
  config: {
    title: 'Erro de Configuração',
    description: 'O sistema não está configurado corretamente.',
    details: 'Verifique se todas as variáveis de ambiente necessárias estão definidas.',
    icon: Settings,
    color: 'text-orange-500',
  },
  auth: {
    title: 'Erro de Autenticação',
    description: 'Não foi possível verificar sua identidade.',
    details: 'Tente fazer login novamente ou entre em contato com o administrador.',
    icon: AlertTriangle,
    color: 'text-red-500',
  },
  permission: {
    title: 'Acesso Negado',
    description: 'Você não tem permissão para acessar este recurso.',
    details: 'Entre em contato com o administrador para solicitar acesso.',
    icon: AlertTriangle,
    color: 'text-yellow-500',
  },
  network: {
    title: 'Erro de Conexão',
    description: 'Não foi possível conectar ao servidor.',
    details: 'Verifique sua conexão com a internet e tente novamente.',
    icon: RefreshCw,
    color: 'text-blue-500',
  },
  default: {
    title: 'Algo deu errado',
    description: 'Ocorreu um erro inesperado.',
    details: 'Tente novamente ou entre em contato com o suporte técnico.',
    icon: AlertTriangle,
    color: 'text-red-500',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('message') || 'default';
  const customMessage = searchParams.get('details');
  
  const error = ERROR_MESSAGES[errorType as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.default;
  const Icon = error.icon;

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${error.color}`} />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {error.title}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {error.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {customMessage || error.details}
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleRefresh}
              variant="primary"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              Voltar
            </Button>
            
            <LinkButton 
              href="/dashboard"
              variant="ghost"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </LinkButton>
          </div>
          
          {errorType === 'config' && (
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
                Para Administradores:
              </h4>
              <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Verifique NEXT_PUBLIC_SUPABASE_URL</li>
                <li>• Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>• Verifique SUPABASE_SERVICE_ROLE_KEY (para operações admin)</li>
              </ul>
            </div>
          )}
          
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            Se o problema persistir, entre em contato com o suporte técnico.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Algo deu errado
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Ocorreu um erro inesperado.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Tente novamente ou entre em contato com o suporte técnico.
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={() => window.location.reload()}
              variant="primary"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <LinkButton 
              href="/dashboard"
              variant="ghost"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Dashboard
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<ErrorFallback />}>
      <ErrorContent />
    </Suspense>
  );
}

