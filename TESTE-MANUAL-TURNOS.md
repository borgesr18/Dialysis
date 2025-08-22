# Roteiro de Testes Manuais - Módulo TURNOS

## Pré-requisitos
- [ ] Sistema rodando em `http://localhost:3000`
- [ ] Usuário autenticado no sistema
- [ ] Acesso ao painel administrativo do Supabase
- [ ] Conexão com banco de dados funcionando

## 1. TESTE DE CRIAÇÃO (CREATE)

### 1.1 Criar Novo Turno
- [ ] Acessar `/turnos`
- [ ] Clicar em "Novo Turno"
- [ ] Verificar se a página `/turnos/new` carrega corretamente
- [ ] Preencher o formulário:
  - **Nome**: "Turno Manhã Teste"
  - **Hora início**: "06:00"
  - **Hora fim**: "10:00"
  - **Dias da semana**: "SEG,QUA,SEX"
- [ ] Clicar em "Salvar"
- [ ] Verificar redirecionamento para `/turnos` com mensagem de sucesso
- [ ] Confirmar que o novo turno aparece na listagem

### 1.2 Verificação no Supabase
- [ ] Acessar o painel do Supabase
- [ ] Ir para a tabela `turnos`
- [ ] Verificar se o registro foi criado com:
  - `nome`: "Turno Manhã Teste"
  - `hora_inicio`: "06:00"
  - `hora_fim`: "10:00"
  - `dias_semana`: ["SEG", "QUA", "SEX"]
  - `clinica_id`: ID da clínica atual
  - `created_at` e `updated_at` preenchidos

## 2. TESTE DE LEITURA (READ)

### 2.1 Listagem de Turnos
- [ ] Acessar `/turnos`
- [ ] Verificar se todos os turnos são exibidos
- [ ] Confirmar que os dados estão corretos:
  - Nome do turno
  - Horário (formato: HH:MM–HH:MM)
  - Dias da semana (separados por vírgula)
  - Botões de ação (Editar/Excluir)

### 2.2 Estado Vazio
- [ ] Se não houver turnos, verificar se o EmptyState é exibido
- [ ] Verificar se o botão "Adicionar Turno" funciona

### 2.3 Ordenação
- [ ] Verificar se os turnos são ordenados por nome
- [ ] Confirmar ordem alfabética na listagem

## 3. TESTE DE ATUALIZAÇÃO (UPDATE)

### 3.1 Editar Turno Existente
- [ ] Na listagem de turnos, clicar em "Editar" em um turno
- [ ] Verificar se a página de edição carrega com dados preenchidos
- [ ] Alterar os dados:
  - **Nome**: "Turno Manhã Teste - Editado"
  - **Hora início**: "07:00"
  - **Hora fim**: "11:00"
  - **Dias da semana**: "SEG,TER,QUA,QUI,SEX"
- [ ] Clicar em "Salvar"
- [ ] Verificar redirecionamento com mensagem de sucesso
- [ ] Confirmar que as alterações aparecem na listagem

### 3.2 Verificação no Supabase
- [ ] Verificar na tabela `turnos` se os dados foram atualizados
- [ ] Confirmar que `updated_at` foi atualizado
- [ ] Verificar se `dias_semana` é um array JSON

## 4. TESTE DE EXCLUSÃO (DELETE)

### 4.1 Excluir Turno
- [ ] Na listagem, clicar em "Excluir" em um turno
- [ ] Verificar se aparece confirmação: "Tem certeza que deseja excluir este turno?"
- [ ] Confirmar a exclusão
- [ ] Verificar redirecionamento com mensagem de sucesso
- [ ] Confirmar que o turno não aparece mais na listagem

### 4.2 Verificação no Supabase
- [ ] Verificar na tabela `turnos` se o registro foi removido
- [ ] **Nota**: Este módulo usa exclusão física (DELETE), não soft delete

## 5. TESTES DE VALIDAÇÃO

### 5.1 Campos Obrigatórios
- [ ] Tentar criar turno sem preencher "Nome"
- [ ] Verificar se a validação HTML5 impede o envio
- [ ] Verificar se mensagem de erro é exibida

### 5.2 Formato de Horários
- [ ] Testar com horários válidos (formato HH:MM)
- [ ] Verificar se campos de time funcionam corretamente
- [ ] Testar valores padrão (06:00 e 10:00)

### 5.3 Dias da Semana
- [ ] Testar formato correto: "SEG,QUA,SEX"
- [ ] Testar com espaços: "SEG, QUA, SEX"
- [ ] Verificar se converte para maiúsculas
- [ ] Testar campo vazio (deve aceitar)

### 5.4 Relacionamentos
- [ ] Verificar se turnos são filtrados por `clinica_id`
- [ ] Confirmar que usuário só vê turnos da sua clínica

## 6. TESTES DE INTERFACE

### 6.1 Layout Responsivo
- [ ] Testar formulário em diferentes tamanhos de tela
- [ ] Verificar se grid responsivo funciona (md:grid-cols-2)
- [ ] Confirmar que tabela é responsiva

### 6.2 Campos de Horário
- [ ] Verificar se inputs type="time" funcionam
- [ ] Testar seleção de horário via interface
- [ ] Confirmar valores padrão são aplicados

### 6.3 Estados de Loading
- [ ] Verificar se há indicadores de carregamento
- [ ] Testar comportamento com conexão lenta

### 6.4 Filtros e Busca
- [ ] Verificar se o botão "Filtrar" está presente
- [ ] **Nota**: Funcionalidade de filtro pode não estar implementada

## 7. TESTES ESPECÍFICOS DO MÓDULO

### 7.1 Processamento de Dias da Semana
- [ ] Testar entrada: "seg,qua,sex" → deve virar ["SEG","QUA","SEX"]
- [ ] Testar entrada: "SEG, QUA, SEX" → deve remover espaços
- [ ] Testar entrada vazia → deve resultar em array vazio
- [ ] Verificar exibição na listagem (join com vírgula)

### 7.2 Formato de Horários na Listagem
- [ ] Verificar se exibe formato "HH:MM–HH:MM"
- [ ] Testar com diferentes horários
- [ ] Confirmar que usa String() para conversão

## 8. CHECKLIST DE VERIFICAÇÃO

### 8.1 UI/UX
- [ ] Layout consistente com outros módulos
- [ ] Ícones e cores apropriados (Clock, azul)
- [ ] Mensagens de feedback claras
- [ ] Navegação intuitiva
- [ ] Animações suaves (fade-in)
- [ ] Grid responsivo no formulário

### 8.2 Backend/Database
- [ ] Dados persistidos corretamente
- [ ] Array JSON para dias_semana
- [ ] Validações funcionando
- [ ] Relacionamentos mantidos
- [ ] Performance adequada
- [ ] Ordenação por nome

### 8.3 Segurança
- [ ] Autenticação obrigatória
- [ ] Isolamento por clínica
- [ ] Validação de permissões
- [ ] Sanitização de dados
- [ ] Tratamento de erros

## 9. PROBLEMAS ENCONTRADOS

### 9.1 Bugs Identificados
```
[Documentar aqui qualquer problema encontrado]
- Problema: 
- Reprodução: 
- Impacto: 
- Status: 
```

### 9.2 Melhorias Sugeridas
```
[Documentar sugestões de melhoria]
- Sugestão: Adicionar seletor visual para dias da semana
- Justificativa: Melhor UX que campo de texto
- Prioridade: Média

- Sugestão: Validação de horário (início < fim)
- Justificativa: Evitar inconsistências
- Prioridade: Alta
```

## 10. CONCLUSÃO

### 10.1 Resumo dos Testes
- [ ] Criação: ✅ Funcionando / ❌ Com problemas
- [ ] Leitura: ✅ Funcionando / ❌ Com problemas  
- [ ] Atualização: ✅ Funcionando / ❌ Com problemas
- [ ] Exclusão: ✅ Funcionando / ❌ Com problemas
- [ ] Validações: ✅ Funcionando / ❌ Com problemas
- [ ] Interface: ✅ Funcionando / ❌ Com problemas
- [ ] Dias da semana: ✅ Funcionando / ❌ Com problemas
- [ ] Horários: ✅ Funcionando / ❌ Com problemas

### 10.2 Status Geral do Módulo
- [ ] ✅ Aprovado para produção
- [ ] ⚠️ Aprovado com ressalvas
- [ ] ❌ Necessita correções

### 10.3 Observações Finais
```
[Comentários gerais sobre o módulo de turnos]
```

---

**Data do Teste**: ___________  
**Testador**: ___________  
**Versão**: ___________