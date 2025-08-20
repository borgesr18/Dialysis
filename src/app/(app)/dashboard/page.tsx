'use client'

import { Button } from '@/components/ui/Button'
import { LinkButton } from '@/components/ui/LinkButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { MedicalDashboard, useMockDashboardData } from '@/components/ui/MedicalDashboard'
import { Users, Activity, Calendar, Settings, Plus, LogOut, Building, Monitor, MapPin, Clock, FileText, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [clinicId, setClinicId] = useState<string | null>(null)
  const router = useRouter()
  const dashboardData = useMockDashboardData()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Buscar clinica_id do usuário
        const { data: clinicData } = await supabase
          .from('usuarios_clinicas')
          .select('clinica_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        setClinicId(clinicData?.clinica_id ?? null)
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-blue-500" />
            Sistema de Diálise
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Olá, {user.email}! Gerencie sua clínica de forma eficiente.
          </p>
          {clinicId && (
            <div className="flex items-center gap-2 mt-2">
              <Building className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Clínica ID: {clinicId}
              </p>
            </div>
          )}
        </div>
        <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
           <LogOut className="h-4 w-4" />
           Sair
         </Button>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/sessoes">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 hover:shadow-glow transition-all duration-200 cursor-pointer border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Stethoscope className="h-8 w-8 text-red-100" />
                    <h3 className="text-lg font-semibold text-white">
                      Sessões
                    </h3>
                  </div>
                  <p className="text-red-100 text-sm">
                    Gerenciar sessões de hemodiálise
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pacientes">
          <Card className="bg-gradient-medical hover:shadow-glow transition-all duration-200 cursor-pointer border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="h-8 w-8 text-blue-100" />
                    <h3 className="text-lg font-semibold text-white">
                      Pacientes
                    </h3>
                  </div>
                  <p className="text-blue-100 text-sm">
                    Gerenciar pacientes da clínica
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/maquinas">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 hover:shadow-glow transition-all duration-200 cursor-pointer border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Monitor className="h-8 w-8 text-green-100" />
                    <h3 className="text-lg font-semibold text-white">
                      Máquinas
                    </h3>
                  </div>
                  <p className="text-green-100 text-sm">
                    Gerenciar equipamentos de diálise
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/relatorios">
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:shadow-glow transition-all duration-200 cursor-pointer border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-8 w-8 text-indigo-100" />
                    <h3 className="text-lg font-semibold text-white">
                      Relatórios
                    </h3>
                  </div>
                  <p className="text-indigo-100 text-sm">
                    Análises e relatórios médicos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/salas">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 hover:shadow-glow transition-all duration-200 cursor-pointer border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <MapPin className="h-8 w-8 text-purple-100" />
                    <h3 className="text-lg font-semibold text-white">
                      Salas
                    </h3>
                  </div>
                  <p className="text-purple-100 text-sm">
                    Gerenciar salas de tratamento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/turnos">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 hover:shadow-glow transition-all duration-200 cursor-pointer border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="h-8 w-8 text-orange-100" />
                    <h3 className="text-lg font-semibold text-white">
                      Turnos
                    </h3>
                  </div>
                  <p className="text-orange-100 text-sm">
                    Gerenciar horários de funcionamento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <LinkButton href="/sessoes/new" className="w-full text-white bg-gradient-to-r from-red-500 to-red-600 hover:shadow-glow transition-all duration-200">
              <Stethoscope className="h-4 w-4 mr-2 text-red-100" />
              Nova Sessão
            </LinkButton>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <LinkButton href="/pacientes/new" className="w-full text-white bg-gradient-medical hover:shadow-glow transition-all duration-200">
              <Users className="h-4 w-4 mr-2 text-blue-100" />
              Novo Paciente
            </LinkButton>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <LinkButton href="/maquinas/new" className="w-full text-white bg-gradient-to-r from-green-500 to-green-600 hover:shadow-glow transition-all duration-200">
              <Monitor className="h-4 w-4 mr-2 text-green-100" />
              Nova Máquina
            </LinkButton>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <LinkButton href="/relatorios" className="w-full text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:shadow-glow transition-all duration-200">
              <FileText className="h-4 w-4 mr-2 text-indigo-100" />
              Ver Relatórios
            </LinkButton>
          </Card>
        </div>
      </div>

      {/* Medical Dashboard */}
      <MedicalDashboard
        sessionSummary={dashboardData.sessionSummary}
        machineSummary={dashboardData.machineSummary}
        patientSummary={dashboardData.patientSummary}
        recentActivities={dashboardData.recentActivities}
        alerts={dashboardData.alerts}
        loading={dashboardData.loading}
      />
    </div>
  )
}