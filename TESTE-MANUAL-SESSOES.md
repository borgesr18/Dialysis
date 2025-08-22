# Roteiro de Testes Manuais - Módulo SESSÕES

## Pré-requisitos
- [ ] Servidor de desenvolvimento rodando (`npm run dev`)
- [ ] Usuário autenticado no sistema
- [ ] Banco Supabase conectado e funcionando
- [ ] Dados de teste disponíveis (pacientes, máquinas, agendamentos)

## 1. TESTE DE CRIAÇÃO (CREATE)

### 1.1 Criar Nova Sessão
- [ ] Acessar `/sessoes`
- [ ] Clicar no botão "Nova Sessão"
- [ ] Acessar `/sessoes/new`
- [ ] Preencher formulário com dados válidos:
  - Paciente: Selecionar da lista
  - Máquina: Selecionar da lista
  - Data da Sessão: Data válida
  - Hora de Início: Horário válido
  - Peso Pré: Valor numérico (kg)
  - Pressão Arterial Pré: Formato 120/80
  - Ultrafiltração Prescrita: Valor em ml
  - Observações: Texto livre
- [ ] Clicar em "Agendar Sessão"
- [ ] Verificar redirecionamento para lista
- [ ] Verificar no Supabase se foi criado na tabela `sessoes`

### 1.2 Validações de Criação
- [ ] Tentar criar sem preencher campos obrigatórios (*)
- [ ] Verificar mensagens de erro para:
  - [ ] Paciente não selecionado
  - [ ] Máquina não selecionada
  - [ ] Data inválida
  - [ ] Hora de início inválida
- [ ] Testar valores inválidos:
  - [ ] Peso negativo
  - [ ] Pressão arterial em formato incorreto
  - [ ] Ultrafiltração com valor inválido

## 2. TESTE DE LEITURA (READ)

### 2.1 Visualização da Lista
- [ ] Verificar carregamento da página `/sessoes`
- [ ] Confirmar exibição dos cards de estatísticas:
  - [ ] Hoje
  - [ ] Em Andamento
  - [ ] Agendadas
  - [ ] Concluídas
- [ ] Verificar seção "Sessões de Hoje"
- [ ] Testar estado vazio (sem sessões)
- [ ] Verificar botão "Criar Primeira Sessão"

### 2.2 Visualização de Sessão Individual
- [ ] Acessar `/sessoes/[id]` de uma sessão existente
- [ ] Verificar exibição de todos os dados:
  - [ ] Informações do paciente
  - [ ] Dados da máquina
  - [ ] Data e horário
  - [ ] Dados pré-diálise
  - [ ] Observações
- [ ] Testar navegação de volta

### 2.3 Estados e Status
- [ ] Verificar diferentes status de sessão:
  - [ ] Agendada
  - [ ] Em Andamento
  - [ ] Concluída
  - [ ] Cancelada
- [ ] Confirmar cores e badges corretas
- [ ] Verificar contadores nas estatísticas

## 3. TESTE DE ATUALIZAÇÃO (UPDATE)

### 3.1 Editar Sessão (se implementado)
- [ ] Acessar sessão individual
- [ ] Procurar botão/link de edição
- [ ] Alterar dados da sessão:
  - [ ] Mudar data/horário
  - [ ] Alterar dados pré-diálise
  - [ ] Modificar observações
- [ ] Salvar alterações
- [ ] Verificar atualização na lista
- [ ] Confirmar no Supabase

### 3.2 Atualizar Status da Sessão
- [ ] Testar mudança de status:
  - [ ] Agendada → Em Andamento
  - [ ] Em Andamento → Concluída
  - [ ] Qualquer → Cancelada
- [ ] Verificar atualização das estatísticas
- [ ] Confirmar persistência no banco

### 3.3 Registrar Dados Durante a Sessão
- [ ] Testar registro de dados em tempo real:
  - [ ] Pressão arterial durante sessão
  - [ ] Ultrafiltração realizada
  - [ ] Intercorrências
  - [ ] Medicações administradas
- [ ] Verificar timestamps dos registros

## 4. TESTE DE EXCLUSÃO (DELETE)

### 4.1 Cancelar Sessão
- [ ] Acessar sessão agendada
- [ ] Procurar opção de cancelamento
- [ ] Informar motivo do cancelamento
- [ ] Confirmar cancelamento
- [ ] Verificar mudança de status
- [ ] Confirmar no Supabase

### 4.2 Exclusão Lógica
- [ ] Verificar se sessão cancelada não aparece em listas ativas
- [ ] Confirmar que dados são mantidos no banco
- [ ] Testar filtros para ver sessões canceladas

## 5. TESTES DE VALIDAÇÃO

### 5.1 Regras de Negócio
- [ ] Verificar disponibilidade de máquina no horário
- [ ] Testar conflito de paciente (múltiplas sessões simultâneas)
- [ ] Validar horários de funcionamento da clínica
- [ ] Testar limites de sessões por dia/paciente

### 5.2 Validações de Dados Médicos
- [ ] Peso pré-diálise dentro de limites aceitáveis
- [ ] Pressão arterial em formato correto
- [ ] Ultrafiltração prescrita coerente com peso
- [ ] Validar dados obrigatórios para início da sessão

### 5.3 Integridade de Dados
- [ ] Verificar relacionamentos com pacientes
- [ ] Confirmar relacionamentos com máquinas
- [ ] Testar relacionamento com agendamentos
- [ ] Validar dados de auditoria (created_at, updated_at)

## 6. TESTES DE INTERFACE

### 6.1 Responsividade
- [ ] Testar em desktop (1920x1080)
- [ ] Testar em tablet (768x1024)
- [ ] Testar em mobile (375x667)
- [ ] Verificar formulários responsivos
- [ ] Testar cards de estatísticas

### 6.2 Usabilidade
- [ ] Navegação intuitiva entre páginas
- [ ] Botões e links funcionais
- [ ] Feedback visual adequado
- [ ] Loading states apropriados
- [ ] Mensagens de erro claras

### 6.3 Acessibilidade
- [ ] Labels adequadas nos formulários
- [ ] Contraste de cores suficiente
- [ ] Navegação por teclado
- [ ] Textos alternativos em ícones

## 7. TESTES ESPECÍFICOS DO MÓDULO

### 7.1 Fluxo de Sessão Completa
- [ ] Criar agendamento
- [ ] Iniciar sessão
- [ ] Registrar dados durante sessão
- [ ] Finalizar sessão
- [ ] Verificar relatório final

### 7.2 Integração com Agenda
- [ ] Verificar criação de sessão a partir de agendamento
- [ ] Testar sincronização de dados
- [ ] Confirmar atualização de status no agendamento

### 7.3 Relatórios e Estatísticas
- [ ] Verificar cálculo correto das estatísticas
- [ ] Testar filtros por período
- [ ] Confirmar dados em tempo real
- [ ] Validar performance com muitos dados

## 8. TESTES DE PERFORMANCE

### 8.1 Carregamento de Dados
- [ ] Tempo de carregamento da lista de sessões
- [ ] Performance com muitas sessões
- [ ] Paginação (se implementada)
- [ ] Busca e filtros rápidos

### 8.2 Operações em Tempo Real
- [ ] Atualização de status em tempo real
- [ ] Sincronização entre usuários
- [ ] Performance durante sessões ativas

## 9. CHECKLIST DE VERIFICAÇÃO

### UI/UX
- [ ] Layout consistente com outros módulos
- [ ] Cores e status bem definidos
- [ ] Ícones apropriados (Calendar, Clock, Users)
- [ ] Textos e labels médicos corretos
- [ ] Navegação intuitiva
- [ ] Feedback visual adequado

### Backend/Database
- [ ] Dados persistidos corretamente
- [ ] Relacionamentos funcionando
- [ ] Triggers e validações ativas
- [ ] Logs de auditoria completos
- [ ] Performance adequada
- [ ] Backup de dados críticos

### Segurança
- [ ] Validação de permissões médicas
- [ ] Proteção de dados sensíveis
- [ ] Auditoria de alterações
- [ ] Controle de acesso por função

### Compliance Médico
- [ ] Rastreabilidade de dados
- [ ] Conformidade com regulamentações
- [ ] Privacidade do paciente
- [ ] Integridade dos registros médicos

## 10. PROBLEMAS ENCONTRADOS

| Problema | Severidade | Status | Observações |
|----------|------------|--------|--------------|
| | | | |
| | | | |
| | | | |

## 11. CONCLUSÃO

### Resumo dos Testes
- [ ] Todos os testes de CRUD passaram
- [ ] Validações médicas funcionando
- [ ] Interface responsiva e acessível
- [ ] Performance adequada
- [ ] Integração com agenda OK
- [ ] Compliance médico atendido

### Status Final
- [ ] ✅ APROVADO - Módulo pronto para produção
- [ ] ⚠️ APROVADO COM RESSALVAS - Pequenos ajustes necessários
- [ ] ❌ REPROVADO - Problemas críticos encontrados

### Observações Finais
_Documentar aqui observações específicas sobre o módulo de sessões, considerações médicas, sugestões de melhorias, etc._

---
**Data do Teste:** ___________  
**Testador:** ___________  
**Versão:** ___________  
**Supervisor Médico:** ___________