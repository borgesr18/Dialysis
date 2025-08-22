# 🧪 TESTE MANUAL - MÓDULO PACIENTES

## Pré-requisitos
- ✅ Servidor de desenvolvimento rodando (`npm run dev`)
- ✅ Supabase conectado
- ✅ Usuário logado na aplicação

## 📋 ROTEIRO DE TESTES CRUD

### 🟢 TESTE 1: CREATE (Criar Paciente)

**Objetivo:** Verificar se é possível criar um novo paciente e se os dados são persistidos corretamente no Supabase.

**Passos:**
1. Acesse: `http://localhost:3000/pacientes`
2. Clique no botão "Novo Paciente" ou "Adicionar Primeiro Paciente"
3. Preencha o formulário com os dados de teste:
   - **Registro:** `TEST001`
   - **Nome completo:** `João Silva Teste`
   - **Cidade:** `Recife`
   - **Observações/Alertas:** `Paciente de teste - pode ser removido`
4. Clique em "Salvar"

**Resultados Esperados:**
- ✅ Redirecionamento para página de detalhes do paciente
- ✅ Mensagem de sucesso: "Paciente criado com sucesso!"
- ✅ Paciente aparece na listagem de pacientes
- ✅ Dados corretos exibidos na interface

**Verificação no Supabase:**
- Acesse o painel do Supabase
- Vá para a tabela `pacientes`
- Confirme que o novo registro foi criado com os dados corretos

---

### 🔵 TESTE 2: READ (Listar/Visualizar Pacientes)

**Objetivo:** Verificar se a listagem e visualização de pacientes funciona corretamente.

**Passos:**
1. Acesse: `http://localhost:3000/pacientes`
2. Verifique se o paciente criado no teste anterior aparece na lista
3. Clique no paciente para ver detalhes (se houver página de detalhes)

**Resultados Esperados:**
- ✅ Lista carrega sem erros
- ✅ Paciente de teste aparece na listagem
- ✅ Dados exibidos corretamente (nome, registro, cidade, status ativo)
- ✅ Avatar com inicial do nome
- ✅ Alerta exibido se houver

---

### 🟡 TESTE 3: UPDATE (Editar Paciente)

**Objetivo:** Verificar se é possível editar um paciente existente e se as alterações são persistidas.

**Passos:**
1. Na listagem de pacientes, clique em "Editar" no paciente de teste
2. Modifique os dados:
   - **Registro:** `TEST001-UPD`
   - **Nome completo:** `João Silva Teste Atualizado`
   - **Cidade:** `Olinda`
   - **Observações/Alertas:** `Paciente de teste atualizado`
3. Clique em "Salvar"

**Resultados Esperados:**
- ✅ Redirecionamento para página de detalhes
- ✅ Mensagem de sucesso: "Paciente atualizado com sucesso!"
- ✅ Dados atualizados na listagem
- ✅ Alterações refletidas na interface

**Verificação no Supabase:**
- Confirme que o registro foi atualizado na tabela `pacientes`
- Verifique se o campo `updated_at` foi atualizado

---

### 🔴 TESTE 4: DELETE (Excluir Paciente)

**Objetivo:** Verificar se é possível excluir um paciente e se a exclusão é tratada corretamente.

**Passos:**
1. Na listagem de pacientes, clique em "Excluir" no paciente de teste
2. Confirme a exclusão na modal de confirmação
3. Verifique se o paciente foi removido da listagem

**Resultados Esperados:**
- ✅ Modal de confirmação aparece com nome do paciente
- ✅ Após confirmação, redirecionamento para listagem
- ✅ Mensagem de sucesso: "Paciente [nome] excluído com sucesso!"
- ✅ Paciente não aparece mais na listagem

**Verificação no Supabase:**
- Confirme que o registro foi removido da tabela `pacientes`
- OU se for soft delete, confirme que `ativo = false`

---

## 🧪 TESTES DE VALIDAÇÃO

### Teste de Campos Obrigatórios
1. Tente criar paciente sem preencher "Registro" - deve mostrar erro
2. Tente criar paciente sem preencher "Nome completo" - deve mostrar erro

### Teste de Unicidade
1. Tente criar dois pacientes com o mesmo registro - deve mostrar erro de duplicação

### Teste de Dependências (DELETE)
1. Se o paciente tiver sessões de hemodiálise, a exclusão deve ser bloqueada
2. Mensagem de erro deve explicar a restrição

---

## 📊 CHECKLIST DE VERIFICAÇÃO

### Interface (UI/UX)
- [ ] Formulários carregam corretamente
- [ ] Validações funcionam no frontend
- [ ] Mensagens de erro/sucesso são exibidas
- [ ] Redirecionamentos funcionam
- [ ] Loading states (se houver)

### Backend/Database
- [ ] Dados são salvos corretamente no Supabase
- [ ] Validações do servidor funcionam
- [ ] Timestamps (created_at, updated_at) são atualizados
- [ ] Restrições de integridade são respeitadas

### Segurança
- [ ] Apenas usuários autenticados podem acessar
- [ ] Usuários só veem pacientes da sua clínica
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
_Adicione aqui observações gerais sobre o módulo de pacientes_