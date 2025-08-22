# Roteiro de Testes Manuais - Módulo AGENDA

## Pré-requisitos
- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Usuário autenticado no sistema
- [ ] Banco Supabase conectado e funcionando
- [ ] Dados de teste disponíveis (pacientes, máquinas, turnos, salas)

## 1. TESTE DE CRIAÇÃO (CREATE)

### 1.1 Criar Novo Agendamento
- [ ] Acessar `/agenda`
- [ ] Clicar no botão "Novo Agendamento"
- [ ] Preencher formulário com dados válidos:
  - Paciente: Selecionar da lista
  - Máquina: Selecionar da lista
  - Data: Data futura
  - Turno: Selecionar da lista
  - Observações: Texto opcional
- [ ] Clicar em "Salvar"
- [ ] Verificar se agendamento aparece no calendário
- [ ] Verificar no Supabase se foi criado na tabela `agendamentos`

### 1.2 Validações de Criação
- [ ] Tentar criar sem preencher campos obrigatórios
- [ ] Verificar mensagens de erro
- [ ] Testar conflitos de horário (mesmo paciente/máquina)
- [ ] Testar data no passado
- [ ] Verificar validação de horários

## 2. TESTE DE LEITURA (READ)

### 2.1 Visualização do Calendário
- [ ] Verificar carregamento da página `/agenda`
- [ ] Testar diferentes visualizações:
  - [ ] Visualização mensal
  - [ ] Visualização semanal
  - [ ] Visualização diária
- [ ] Verificar se agendamentos são exibidos corretamente
- [ ] Testar navegação entre datas

### 2.2 Filtros e Busca
- [ ] Clicar no botão "Filtros"
- [ ] Testar filtro por paciente
- [ ] Testar filtro por máquina
- [ ] Testar filtro por turno
- [ ] Testar filtro por status
- [ ] Testar filtro por período (data início/fim)
- [ ] Testar busca por texto
- [ ] Verificar contador de filtros ativos
- [ ] Testar "Limpar Filtros"

### 2.3 Estatísticas
- [ ] Verificar cards de estatísticas no topo
- [ ] Confirmar contadores por status:
  - Agendado
  - Confirmado
  - Em Andamento
  - Concluído
  - Cancelado
  - Faltou

## 3. TESTE DE ATUALIZAÇÃO (UPDATE)

### 3.1 Editar Agendamento
- [ ] Clicar em um agendamento no calendário
- [ ] Verificar abertura do modal de edição
- [ ] Alterar dados do agendamento:
  - [ ] Mudar data
  - [ ] Mudar horário
  - [ ] Mudar máquina
  - [ ] Alterar observações
- [ ] Salvar alterações
- [ ] Verificar atualização no calendário
- [ ] Confirmar no Supabase

### 3.2 Alterar Status
- [ ] Testar mudança de status:
  - [ ] Agendado → Confirmado
  - [ ] Confirmado → Em Andamento
  - [ ] Em Andamento → Concluído
  - [ ] Qualquer → Cancelado
  - [ ] Qualquer → Faltou
- [ ] Verificar cores/badges no calendário
- [ ] Confirmar atualização das estatísticas

## 4. TESTE DE EXCLUSÃO (DELETE)

### 4.1 Cancelar Agendamento
- [ ] Abrir agendamento para edição
- [ ] Clicar em "Cancelar Agendamento"
- [ ] Informar motivo do cancelamento
- [ ] Confirmar cancelamento
- [ ] Verificar mudança de status para "Cancelado"
- [ ] Confirmar no Supabase

## 5. TESTES DE VALIDAÇÃO

### 5.1 Conflitos de Agendamento
- [ ] Tentar agendar mesmo paciente em horários sobrepostos
- [ ] Tentar agendar mesma máquina em horários sobrepostos
- [ ] Verificar mensagens de conflito
- [ ] Testar resolução de conflitos

### 5.2 Regras de Negócio
- [ ] Verificar disponibilidade de slots
- [ ] Testar limites de agendamentos por dia
- [ ] Verificar horários de funcionamento
- [ ] Testar agendamentos em feriados/fins de semana

## 6. TESTES DE INTERFACE

### 6.1 Responsividade
- [ ] Testar em desktop (1920x1080)
- [ ] Testar em tablet (768x1024)
- [ ] Testar em mobile (375x667)
- [ ] Verificar calendário responsivo
- [ ] Testar modais em diferentes tamanhos

### 6.2 Estados de Loading
- [ ] Verificar loading inicial da página
- [ ] Testar loading ao criar agendamento
- [ ] Verificar loading ao aplicar filtros
- [ ] Testar loading ao navegar no calendário

### 6.3 Tratamento de Erros
- [ ] Simular erro de conexão
- [ ] Testar erro ao carregar dados
- [ ] Verificar mensagens de erro amigáveis
- [ ] Testar botão "Tentar novamente"

## 7. TESTES ESPECÍFICOS DO MÓDULO

### 7.1 Calendário Interativo
- [ ] Clicar em slots vazios para criar agendamento
- [ ] Arrastar e soltar agendamentos (se implementado)
- [ ] Testar zoom do calendário
- [ ] Verificar tooltips nos eventos

### 7.2 Integração com Outros Módulos
- [ ] Verificar dados de pacientes atualizados
- [ ] Confirmar máquinas ativas/inativas
- [ ] Testar turnos configurados
- [ ] Verificar salas disponíveis

## 8. CHECKLIST DE VERIFICAÇÃO

### UI/UX
- [ ] Layout consistente com o design
- [ ] Cores e badges corretas por status
- [ ] Ícones apropriados
- [ ] Textos e labels claros
- [ ] Navegação intuitiva
- [ ] Feedback visual adequado

### Backend/Database
- [ ] Dados persistidos corretamente
- [ ] Relacionamentos mantidos
- [ ] Triggers funcionando
- [ ] Logs de auditoria
- [ ] Performance adequada

### Segurança
- [ ] Validação de permissões
- [ ] Sanitização de dados
- [ ] Proteção contra SQL injection
- [ ] Autenticação obrigatória

## 9. PROBLEMAS ENCONTRADOS

| Problema | Severidade | Status | Observações |
|----------|------------|--------|--------------|
| | | | |
| | | | |
| | | | |

## 10. CONCLUSÃO

### Resumo dos Testes
- [ ] Todos os testes de CRUD passaram
- [ ] Validações funcionando corretamente
- [ ] Interface responsiva
- [ ] Performance adequada
- [ ] Integração com outros módulos OK

### Status Final
- [ ] ✅ APROVADO - Módulo pronto para produção
- [ ] ⚠️ APROVADO COM RESSALVAS - Pequenos ajustes necessários
- [ ] ❌ REPROVADO - Problemas críticos encontrados

### Observações Finais
_Documentar aqui observações gerais sobre o módulo, sugestões de melhorias, etc._

---
**Data do Teste:** ___________  
**Testador:** ___________  
**Versão:** ___________