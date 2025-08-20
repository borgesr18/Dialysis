'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { createAdminClient } from '@/lib/supabase-admin';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export default function DebugPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTest = (test: TestResult) => {
    setTests(prev => [...prev, test]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Environment Variables
    addTest({
      name: 'Environment Variables',
      status: 'pending',
      message: 'Checking environment variables...'
    });

    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV
    };

    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length === 0) {
      setTests(prev => prev.map(test => 
        test.name === 'Environment Variables' 
          ? { ...test, status: 'success', message: 'All environment variables are present', details: envVars }
          : test
      ));
    } else {
      setTests(prev => prev.map(test => 
        test.name === 'Environment Variables' 
          ? { ...test, status: 'error', message: `Missing variables: ${missingVars.join(', ')}`, details: envVars }
          : test
      ));
    }

    // Test 2: Supabase Client Creation
    addTest({
      name: 'Supabase Client Creation',
      status: 'pending',
      message: 'Creating Supabase client...'
    });

    try {
      const supabase = createClient();
      setTests(prev => prev.map(test => 
        test.name === 'Supabase Client Creation' 
          ? { ...test, status: 'success', message: 'Supabase client created successfully' }
          : test
      ));

      // Test 3: Supabase Connection
      addTest({
        name: 'Supabase Connection',
        status: 'pending',
        message: 'Testing connection to Supabase...'
      });

      const { data, error } = await supabase.from('clinicas').select('count').limit(1);
      
      if (error) {
        setTests(prev => prev.map(test => 
          test.name === 'Supabase Connection' 
            ? { ...test, status: 'error', message: `Connection failed: ${error.message}`, details: error }
            : test
        ));
      } else {
        setTests(prev => prev.map(test => 
          test.name === 'Supabase Connection' 
            ? { ...test, status: 'success', message: 'Successfully connected to Supabase' }
            : test
        ));
      }
    } catch (error: any) {
      setTests(prev => prev.map(test => 
        test.name === 'Supabase Client Creation' 
          ? { ...test, status: 'error', message: `Client creation failed: ${error.message}`, details: error }
          : test
      ));
    }

    // Test 4: Admin Client (only test creation, not connection)
    addTest({
      name: 'Admin Client Creation',
      status: 'pending',
      message: 'Testing admin client creation...'
    });

    try {
      const adminClient = createAdminClient();
      setTests(prev => prev.map(test => 
        test.name === 'Admin Client Creation' 
          ? { ...test, status: 'success', message: 'Admin client created successfully' }
          : test
      ));
    } catch (error: any) {
      setTests(prev => prev.map(test => 
        test.name === 'Admin Client Creation' 
          ? { ...test, status: 'error', message: `Admin client creation failed: ${error.message}`, details: error }
          : test
      ));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Supabase Debug Dashboard</h1>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>

          <div className="space-y-4">
            {tests.map((test, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-4 h-4 rounded-full ${
                    test.status === 'success' ? 'bg-green-500' :
                    test.status === 'error' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <h3 className="font-semibold text-lg">{test.name}</h3>
                </div>
                
                <p className={`text-sm mb-2 ${
                  test.status === 'success' ? 'text-green-700' :
                  test.status === 'error' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {test.message}
                </p>

                {test.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                      Show Details
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {tests.length === 0 && !isRunning && (
            <div className="text-center py-8 text-gray-500">
              Click "Run Tests" to start debugging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}