# 🧪 TESTE MANUAL - MÓDULO MÁQUINAS

## Pré-requisitos
- ✅ Servidor de desenvolvimento rodando (`npm run dev`)
- ✅ Supabase conectado
- ✅ Usuário logado na aplicação
- ✅ Pelo menos uma sala cadastrada (para associar à máquina)

## 📋 ROTEIRO DE TESTES CRUD

### 🟢 TESTE 1: CREATE (Criar Máquina)

**Objetivo:** Verificar se é possível criar uma nova máquina e se os dados são persistidos corretamente no Supabase.

**Passos:**
1. Acesse: `http://localhost:3000/maquinas`
2. Clique no botão "Nova Máquina"
3. Preencha o formulário com os dados de teste:
   - **Identificador:** `MAQ-TEST-001` (obrigatório)
   - **Sala:** Selecione uma sala disponível
   - **Marca:** `Fresenius`
   - **Modelo:** `4008S Classic`
   - **Número de Série:** `TEST123456`
   - **Status:** `Ativa`
4. Clique em "Criar Máquina"

**Resultados Esperados:**
- ✅ Redirecionamento para página de listagem de máquinas
- ✅ Mensagem de sucesso: "Máquina criada com sucesso"
- ✅ Máquina aparece na listagem
- ✅ Dados corretos exibidos (identificador, modelo, marca, status ativo)
- ✅ Ícone de atividade (Activity) exibido

**Verificação no Supabase:**
- Acesse o painel do Supabase
- Vá para a tabela `maquinas`
- Confirme que o novo registro foi criado com os dados corretos
- Verifique se `ativa = true` e `clinica_id` está preenchido

---

### 🔵 TESTE 2: READ (Listar/Visualizar Máquinas)

**Objetivo:** Verificar se a listagem e visualização de máquinas funciona corretamente.

**Passos:**
1. Acesse: `http://localhost:3000/maquinas`
2. Verifique se a máquina criada no teste anterior aparece na lista
3. Observe a estrutura da tabela e informações exibidas

**Resultados Esperados:**
- ✅ Lista carrega sem erros
- ✅ Máquina de teste aparece na listagem
- ✅ Colunas exibidas corretamente:
  - Número (identificador)
  - Modelo (com marca abaixo)
  - Status (badge verde "Ativa")
  - Observações (N/A)
  - Ações (botões Editar e Excluir)
- ✅ Ícone Activity exibido ao lado do identificador
- ✅ Hover effect nas linhas da tabela

---

### 🟡 TESTE 3: UPDATE (Editar Máquina)

**Objetivo:** Verificar se é possível editar uma máquina existente e se as alterações são persistidas.

**Passos:**
1. Na listagem de máquinas, clique no botão "Editar" (ícone Edit) da máquina de teste
2. Modifique os dados:
   - **Identificador:** `MAQ-TEST-001-UPD`
   - **Marca:** `Baxter`
   - **Modelo:** `AK 200 Ultra S`
   - **Número de Série:** `TEST123456-UPD`
   - **Status:** Manter como `Ativa`
3. Clique em "Salvar" ou "Atualizar Máquina"

**Resultados Esperados:**
- ✅ Redirecionamento para página de listagem
- ✅ Mensagem de sucesso: "Máquina atualizada com sucesso"
- ✅ Dados atualizados na listagem
- ✅ Alterações refletidas na interface

**Verificação no Supabase:**
- Confirme que o registro foi atualizado na tabela `maquinas`
- Verifique se o campo `updated_at` foi atualizado
- Confirme que todos os campos modificados foram salvos

---

### 🔴 TESTE 4: DELETE (Excluir Máquina)

**Objetivo:** Verificar se é possível desativar uma máquina (soft delete) e se a operação é tratada corretamente.

**Passos:**
1. Na listagem de máquinas, clique no botão "Excluir" (ícone Trash2) da máquina de teste
2. Confirme a exclusão (se houver modal de confirmação)
3. Verifique se a máquina foi removida da listagem

**Resultados Esperados:**
- ✅ Redirecionamento para página de listagem
- ✅ Mensagem de sucesso: "Máquina desativada com sucesso"
- ✅ Máquina não aparece mais na listagem (pois só mostra `ativa = true`)

**Verificação no Supabase:**
- Confirme que o registro ainda existe na tabela `maquinas`
- Verifique se `ativa = false` (soft delete)
- Confirme que `updated_at` foi atualizado

---

## 🧪 TESTES DE VALIDAÇÃO

### Teste de Campos Obrigatórios
1. Tente criar máquina sem preencher "Identificador" - deve mostrar erro
2. Verifique se outros campos opcionais podem ficar vazios

### Teste de Unicidade
1. Tente criar duas máquinas com o mesmo identificador - deve mostrar erro de duplicação

### Teste de Relacionamentos
1. Teste criar máquina sem selecionar sala (deve permitir)
2. Teste criar máquina com sala válida (deve associar corretamente)

### Teste de Estados
1. Crie máquina com status "Inativa" - deve aparecer badge vermelho
2. Crie máquina com status "Ativa" - deve aparecer badge verde

---

## 🔧 TESTES DE INTERFACE

### Teste de Empty State
1. Se não houver máquinas, deve exibir:
   - Título: "Nenhuma máquina cadastrada"
   - Descrição: "Comece adicionando a primeira máquina de hemodiálise da clínica."
   - Botão: "Nova Máquina"

### Teste de Filtros
1. Clique no botão "Filtrar" - verificar se funciona (pode estar não implementado)

### Teste de Responsividade
1. Teste a tabela em diferentes tamanhos de tela
2. Verifique se o scroll horizontal funciona em telas pequenas

---

## 📊 CHECKLIST DE VERIFICAÇÃO

### Interface (UI/UX)
- [ ] Header com título "Máquinas" e ícone Settings
- [ ] Botão "Nova Máquina" com ícone Plus
- [ ] Botão "Filtrar" com ícone Filter
- [ ] Tabela responsiva com scroll horizontal
- [ ] Badges de status com cores corretas
- [ ] Ícones Activity nas linhas da tabela
- [ ] Botões de ação (Editar/Excluir) funcionais
- [ ] Hover effects nas linhas
- [ ] Mensagens de sucesso/erro exibidas

### Backend/Database
- [ ] Dados são salvos corretamente no Supabase
- [ ] Soft delete funciona (ativa = false)
- [ ] Relacionamento com salas funciona
- [ ] Validações do servidor funcionam
- [ ] Timestamps são atualizados
- [ ] Filtro por clínica funciona

### Segurança
- [ ] Apenas usuários autenticados podem acessar
- [ ] Usuários só veem máquinas da sua clínica
- [ ] Validações de permissão funcionam

---

## 🐛 PROBLEMAS ENCONTRADOS

_Documente aqui qualquer problema encontrado durante os testes:_

### Problema 1: [Descrever problema]
- **Descrição:** 
- **Passos para reproduzir:** 
- **Resultado esperado:** 
- **Resultado atual:** 
- **Severidade:** Alta/Média/Baixa

### Problema 2: [Descrever problema]
- **Descrição:** 
- **Passos para reproduzir:** 
- **Resultado esperado:** 
- **Resultado atual:** 
- **Severidade:** Alta/Média/Baixa

---

## ✅ CONCLUSÃO

Após completar todos os testes:

- [ ] **CREATE** - Funcionando ✅ / Com problemas ❌
- [ ] **READ** - Funcionando ✅ / Com problemas ❌  
- [ ] **UPDATE** - Funcionando ✅ / Com problemas ❌
- [ ] **DELETE** - Funcionando ✅ / Com problemas ❌

**Status Geral do Módulo:** ✅ Aprovado / ⚠️ Com ressalvas / ❌ Reprovado

**Observações finais:**
_Adicione aqui observações gerais sobre o módulo de máquinas_

---

## 📝 NOTAS TÉCNICAS

- O módulo usa soft delete (`ativa = false`) em vez de exclusão física
- A listagem só mostra máquinas ativas (`ativa = true`)
- O relacionamento com salas é opcional
- O identificador é obrigatório e deve ser único
- A interface usa componentes reutilizáveis (Card, Button, LinkButton)
- Suporte a tema escuro implementado