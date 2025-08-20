'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Users, Activity, Calendar, Settings, Plus, LogOut, Building } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, clinicId, signOut } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carregando...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo ao Sistema de Diálise
          </h1>
          <p className="text-gray-600 mt-2">
            Olá, {user.email}! Gerencie sua clínica de forma eficiente.
          </p>
          {clinicId && (
            <div className="flex items-center gap-2 mt-2">
              <Building className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-600">
                Clínica ID: {clinicId}
              </p>
            </div>
          )}
        </div>
        <Button onClick={signOut} variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link href="/pacientes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Gerenciar pacientes
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/maquinas">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Máquinas
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Gerenciar máquinas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/salas">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Salas
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Gerenciar salas
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/turnos">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Turnos
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Gerenciar turnos
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/pacientes?action=new">
            <Button className="w-full flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Paciente
            </Button>
          </Link>
          <Link href="/maquinas?action=new">
            <Button className="w-full flex items-center gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Nova Máquina
            </Button>
          </Link>
          <Link href="/salas?action=new">
            <Button className="w-full flex items-center gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Nova Sala
            </Button>
          </Link>
          <Link href="/turnos?action=new">
            <Button className="w-full flex items-center gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Novo Turno
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Últimas ações realizadas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Nenhuma atividade recente encontrada.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}