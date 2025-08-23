'use client';

import { useState } from 'react';

interface EnvStatus {
  name: string;
  value: string | undefined;
  isPresent: boolean;
  isValid: boolean;
}

export default function EnvDebug() {
  const [showDebug, setShowDebug] = useState(false);

  const envVars: EnvStatus[] = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      isPresent: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      isValid: !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isPresent: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isValid: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 50
    }
  ];

  const allValid = envVars.every(env => env.isValid);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className={`px-3 py-2 rounded-lg text-sm font-medium ${
          allValid 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white animate-pulse'
        }`}
      >
        {allValid ? '✓ ENV OK' : '⚠ ENV ERROR'}
      </button>

      {showDebug && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[400px] max-h-96 overflow-auto">
          <h3 className="font-bold text-lg mb-3">Environment Variables Debug</h3>
          
          <div className="space-y-3">
            {envVars.map((env) => (
              <div key={env.name} className="border-b pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-3 h-3 rounded-full ${
                    env.isValid ? 'bg-green-500' : env.isPresent ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <span className="font-medium text-sm">{env.name}</span>
                </div>
                
                <div className="text-xs text-gray-600 ml-5">
                  <div>Present: {env.isPresent ? 'Yes' : 'No'}</div>
                  <div>Valid: {env.isValid ? 'Yes' : 'No'}</div>
                  {env.isPresent && (
                    <div className="mt-1">
                      Value: <span className="font-mono bg-gray-100 px-1 rounded">
                        {env.value ? `${env.value.substring(0, 20)}...` : 'undefined'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">
              <div>Environment: {process.env.NODE_ENV}</div>
              <div>Build Time: {new Date().toISOString()}</div>
            </div>
          </div>

          {!allValid && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700 font-medium">⚠ Configuração Incompleta</p>
              <p className="text-xs text-red-600 mt-1">
                Verifique as variáveis de ambiente no Vercel Dashboard em Settings → Environment Variables
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}