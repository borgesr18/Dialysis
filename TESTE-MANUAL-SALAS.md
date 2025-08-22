# Roteiro de Testes Manuais - Módulo SALAS

## Pré-requisitos
- [ ] Sistema rodando em `http://localhost:3000`
- [ ] Usuário autenticado no sistema
- [ ] Acesso ao painel administrativo do Supabase
- [ ] Conexão com banco de dados funcionando

## 1. TESTE DE CRIAÇÃO (CREATE)

### 1.1 Criar Nova Sala
- [ ] Acessar `/salas`
- [ ] Clicar em "Nova Sala"
- [ ] Verificar se a página `/salas/new` carrega corretamente
- [ ] Preencher o formulário:
  - **Nome**: "Sala de Teste 01"
  - **Descrição**: "Sala criada para teste do sistema"
- [ ] Clicar em "Salvar"
- [ ] Verificar redirecionamento para `/salas` com mensagem de sucesso
- [ ] Confirmar que a nova sala aparece na listagem

### 1.2 Verificação no Supabase
- [ ] Acessar o painel do Supabase
- [ ] Ir para a tabela `salas`
- [ ] Verificar se o registro foi criado com:
  - `nome`: "Sala de Teste 01"
  - `descricao`: "Sala criada para teste do sistema"
  - `clinica_id`: ID da clínica atual
  - `created_at` e `updated_at` preenchidos

## 2. TESTE DE LEITURA (READ)

### 2.1 Listagem de Salas
- [ ] Acessar `/salas`
- [ ] Verificar se todas as salas são exibidas
- [ ] Confirmar que os dados estão corretos:
  - Nome da sala
  - Descrição (ou "—" se vazio)
  - Botões de ação (Editar/Excluir)

### 2.2 Estado Vazio
- [ ] Se não houver salas, verificar se o EmptyState é exibido
- [ ] Verificar se o botão "Adicionar Sala" funciona

## 3. TESTE DE ATUALIZAÇÃO (UPDATE)

### 3.1 Editar Sala Existente
- [ ] Na listagem de salas, clicar em "Editar" em uma sala
- [ ] Verificar se a página de edição carrega com dados preenchidos
- [ ] Alterar os dados:
  - **Nome**: "Sala de Teste 01 - Editada"
  - **Descrição**: "Descrição atualizada para teste"
- [ ] Clicar em "Salvar"
- [ ] Verificar redirecionamento com mensagem de sucesso
- [ ] Confirmar que as alterações aparecem na listagem

### 3.2 Verificação no Supabase
- [ ] Verificar na tabela `salas` se os dados foram atualizados
- [ ] Confirmar que `updated_at` foi atualizado

## 4. TESTE DE EXCLUSÃO (DELETE)

### 4.1 Excluir Sala
- [ ] Na listagem, clicar em "Excluir" em uma sala
- [ ] Verificar se aparece confirmação: "Tem certeza que deseja excluir esta sala?"
- [ ] Confirmar a exclusão
- [ ] Verificar redirecionamento com mensagem de sucesso
- [ ] Confirmar que a sala não aparece mais na listagem

### 4.2 Verificação no Supabase
- [ ] Verificar na tabela `salas` se o registro foi removido
- [ ] **Nota**: Este módulo usa exclusão física (DELETE), não soft delete

## 5. TESTES DE VALIDAÇÃO

### 5.1 Campos Obrigatórios
- [ ] Tentar criar sala sem preencher "Nome"
- [ ] Verificar se a validação HTML5 impede o envio
- [ ] Verificar se mensagem de erro é exibida

### 5.2 Relacionamentos
- [ ] Verificar se salas são filtradas por `clinica_id`
- [ ] Confirmar que usuário só vê salas da sua clínica

## 6. TESTES DE INTERFACE

### 6.1 Responsividade
- [ ] Testar em diferentes tamanhos de tela
- [ ] Verificar se a tabela é responsiva
- [ ] Confirmar que botões ficam acessíveis em mobile

### 6.2 Estados de Loading
- [ ] Verificar se há indicadores de carregamento
- [ ] Testar comportamento com conexão lenta

### 6.3 Filtros e Busca
- [ ] Verificar se o botão "Filtrar" está presente
- [ ] **Nota**: Funcionalidade de filtro pode não estar implementada

## 7. CHECKLIST DE VERIFICAÇÃO

### 7.1 UI/UX
- [ ] Layout consistente com outros módulos
- [ ] Ícones e cores apropriados
- [ ] Mensagens de feedback claras
- [ ] Navegação intuitiva
- [ ] Animações suaves (fade-in)

### 7.2 Backend/Database
- [ ] Dados persistidos corretamente
- [ ] Validações funcionando
- [ ] Relacionamentos mantidos
- [ ] Performance adequada

### 7.3 Segurança
- [ ] Autenticação obrigatória
- [ ] Isolamento por clínica
- [ ] Validação de permissões
- [ ] Sanitização de dados

## 8. PROBLEMAS ENCONTRADOS

### 8.1 Bugs Identificados
```
[Documentar aqui qualquer problema encontrado]
- Problema: 
- Reprodução: 
- Impacto: 
- Status: 
```

### 8.2 Melhorias Sugeridas
```
[Documentar sugestões de melhoria]
- Sugestão: 
- Justificativa: 
- Prioridade: 
```

## 9. CONCLUSÃO

### 9.1 Resumo dos Testes
- [ ] Criação: ✅ Funcionando / ❌ Com problemas
- [ ] Leitura: ✅ Funcionando / ❌ Com problemas  
- [ ] Atualização: ✅ Funcionando / ❌ Com problemas
- [ ] Exclusão: ✅ Funcionando / ❌ Com problemas
- [ ] Validações: ✅ Funcionando / ❌ Com problemas
- [ ] Interface: ✅ Funcionando / ❌ Com problemas

### 9.2 Status Geral do Módulo
- [ ] ✅ Aprovado para produção
- [ ] ⚠️ Aprovado com ressalvas
- [ ] ❌ Necessita correções

### 9.3 Observações Finais
```
[Comentários gerais sobre o módulo de salas]
```

---

**Data do Teste**: ___________  
**Testador**: ___________  
**Versão**: ___________