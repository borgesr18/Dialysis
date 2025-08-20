'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { createAdminClient } from '@/lib/supabase-admin';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  details?: any;
}

interface EnvironmentInfo {
  variable: string;
  present: boolean;
  value?: string;
  masked?: string;
}

export default function DebugPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Environment Variables', status: 'loading', message: 'Checking environment variables...' },
    { name: 'Supabase Client Creation', status: 'loading', message: 'Creating Supabase client...' },
    { name: 'Supabase Connection', status: 'loading', message: 'Testing connection to Supabase...' },
    { name: 'Admin Client Creation', status: 'loading', message: 'Creating Admin client...' },
    { name: 'React Hydration Check', status: 'loading', message: 'Checking for hydration issues...' }
  ]);

  const [environmentInfo, setEnvironmentInfo] = useState<EnvironmentInfo[]>([]);
  const [buildInfo, setBuildInfo] = useState<any>(null);

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...update } : test));
  };

  useEffect(() => {
    runTests();
  }, []);

  const maskValue = (value: string | undefined): string => {
    if (!value) return 'NOT_SET';
    if (value.length <= 8) return '***';
    return value.substring(0, 4) + '***' + value.substring(value.length - 4);
  };

  const runTests = async () => {
    // Test 1: Environment Variables - Detailed Analysis
    const envVariables = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const envInfo: EnvironmentInfo[] = envVariables.map(variable => {
      const value = process.env[variable];
      return {
        variable,
        present: !!value,
        value: value,
        masked: maskValue(value)
      };
    });

    setEnvironmentInfo(envInfo);

    const missingVars = envInfo.filter(info => !info.present).map(info => info.variable);
    const presentVars = envInfo.filter(info => info.present).map(info => info.variable);

    if (missingVars.length === 0) {
      updateTest(0, {
        status: 'success',
        message: `All ${envVariables.length} environment variables are present`,
        details: {
          present: presentVars,
          missing: [],
          environment: typeof window !== 'undefined' ? 'client' : 'server',
          nodeEnv: process.env.NODE_ENV
        }
      });
    } else {
      updateTest(0, {
        status: 'error',
        message: `Missing ${missingVars.length}/${envVariables.length} environment variables: ${missingVars.join(', ')}`,
        details: {
          present: presentVars,
          missing: missingVars,
          environment: typeof window !== 'undefined' ? 'client' : 'server',
          nodeEnv: process.env.NODE_ENV,
          suggestions: [
            'Check if .env.local file exists in project root',
            'Verify environment variables are set in Vercel dashboard',
            'Ensure variables start with NEXT_PUBLIC_ for client-side access',
            'Check if deployment has the latest environment variables'
          ]
        }
      });
    }

    // Test 2: Supabase Client Creation
    try {
      const supabase = createClient();
      updateTest(1, {
        status: 'success',
        message: 'Supabase client created successfully',
        details: { 
          client: !!supabase,
          clientType: typeof supabase,
          hasAuth: !!supabase?.auth,
          hasFrom: !!supabase?.from
        }
      });

      // Test 3: Supabase Connection
      try {
        const { data, error } = await supabase.from('clinicas').select('count').limit(1);
        if (error) {
          updateTest(2, {
            status: 'error',
            message: `Connection failed: ${error.message}`,
            details: {
              error,
              errorCode: error.code,
              errorDetails: error.details,
              hint: error.hint,
              suggestions: [
                'Check if Supabase project is active',
                'Verify database permissions and RLS policies',
                'Ensure clinicas table exists',
                'Check network connectivity'
              ]
            }
          });
        } else {
          updateTest(2, {
            status: 'success',
            message: 'Successfully connected to Supabase and queried clinicas table',
            details: { 
              data,
              querySuccess: true,
              tableAccess: 'clinicas table accessible'
            }
          });
        }
      } catch (connectionError: any) {
        updateTest(2, {
          status: 'error',
          message: `Connection error: ${connectionError?.message || connectionError}`,
          details: {
            error: connectionError,
            errorType: typeof connectionError,
            stack: connectionError?.stack
          }
        });
      }
    } catch (clientError: any) {
      updateTest(1, {
        status: 'error',
        message: `Client creation failed: ${clientError?.message || clientError}`,
        details: {
          error: clientError,
          errorType: typeof clientError,
          stack: clientError?.stack
        }
      });
      updateTest(2, {
        status: 'error',
        message: 'Skipped due to client creation failure',
        details: null
      });
    }

    // Test 4: Admin Client Creation
    try {
      const adminClient = createAdminClient();
      updateTest(3, {
        status: 'success',
        message: 'Admin client created successfully',
        details: { 
          client: !!adminClient,
          clientType: typeof adminClient,
          hasAuth: !!adminClient?.auth,
          hasFrom: !!adminClient?.from
        }
      });
    } catch (adminError: any) {
      updateTest(3, {
        status: 'error',
        message: `Admin client creation failed: ${adminError?.message || adminError}`,
        details: {
          error: adminError,
          errorType: typeof adminError,
          stack: adminError?.stack,
          suggestions: [
            'Check if SUPABASE_SERVICE_ROLE_KEY is set',
            'Verify the service role key is correct',
            'Ensure the key has proper permissions'
          ]
        }
      });
    }

    // Test 5: React Hydration Check
    try {
      const isClient = typeof window !== 'undefined';
      const hasDocument = typeof document !== 'undefined';
      const hasNavigator = typeof navigator !== 'undefined';
      
      updateTest(4, {
        status: 'success',
        message: 'React hydration environment check passed',
        details: {
          isClient,
          hasDocument,
          hasNavigator,
          userAgent: hasNavigator ? navigator.userAgent : 'N/A',
          url: hasDocument ? document.URL : 'N/A',
          readyState: hasDocument ? document.readyState : 'N/A'
        }
      });
    } catch (hydrationError: any) {
      updateTest(4, {
        status: 'error',
        message: `Hydration check failed: ${hydrationError?.message || hydrationError}`,
        details: {
          error: hydrationError,
          suggestions: [
            'Check for server/client rendering mismatches',
            'Verify useEffect usage for client-only code',
            'Check for DOM manipulation in server components'
          ]
        }
      });
    }

    // Build Info
    setBuildInfo({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      platform: typeof window !== 'undefined' ? 'browser' : 'server',
      nextVersion: process.env.npm_package_dependencies_next || 'unknown'
    });
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'loading': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'loading': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Supabase Debug Dashboard</h1>
            <button
              onClick={runTests}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Re-run Tests
            </button>
          </div>

          {/* Environment Variables Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-3">Environment Variables Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {environmentInfo.map((env, index) => (
                <div key={index} className={`p-3 rounded border ${
                  env.present ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <span>{env.present ? '✅' : '❌'}</span>
                    <span className="font-mono text-sm">{env.variable}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {env.masked}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Build Information */}
          {buildInfo && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Build Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Environment:</span>
                  <div>{buildInfo.environment}</div>
                </div>
                <div>
                  <span className="font-semibold">Platform:</span>
                  <div>{buildInfo.platform}</div>
                </div>
                <div>
                  <span className="font-semibold">Timestamp:</span>
                  <div>{new Date(buildInfo.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <span className="font-semibold">Next.js:</span>
                  <div>{buildInfo.nextVersion}</div>
                </div>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{getStatusIcon(test.status)}</span>
                  <h3 className="font-semibold text-lg">{test.name}</h3>
                </div>
                <p className={`mb-2 ${getStatusColor(test.status)}`}>{test.message}</p>
                {test.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      Show Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}