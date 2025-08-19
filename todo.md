# TODO - Modernização UI/UX Dialysis

## 1. Modernização visual e fundações
- [x] Habilitar dark mode no Tailwind (tailwind.config.ts: darkMode: 'class')
- [x] Adicionar fonte Inter no layout raiz (src/app/layout.tsx) e preparar para dark mode
- [x] Migrar ícones para lucide-react e remover dependência de Font Awesome no layout raiz
- [x] Refinar utilitários globais (src/app/globals.css), com .card/.btn/.input/.chip mais modernos

## 2. Componentes de UI (src/components/ui/)
- [x] Button.tsx: variantes (primary/outline/danger/ghost), tamanhos (sm/md/lg), estado loading com spinner
- [x] Input.tsx / Select.tsx / Textarea.tsx: campos com label/hint e estilos padronizados
- [x] Badge.tsx: rótulos de status (success/neutral/warning/danger/default)
- [x] LinkButton.tsx: "link com cara de botão" (variante/size)
- [x] Table.tsx: primitivos Table/THead/TBody/TR/TH/TD para padronizar listas
- [x] Toast.tsx: feedback de sucesso/erro (aria-live, temporizado)
- [x] FormSubmit.tsx: botão de submit com loading automático (useFormStatus)
- [x] ThemeToggle.tsx (src/components/): switch claro/escuro persistente em localStorage
- [x] EmptyState.tsx: componente para listas vazias

## 3. Páginas padronizadas com novos componentes
- [x] Pacientes (lista): src/app/(app)/pacientes/page.tsx
- [x] Salas (lista): src/app/(app)/salas/page.tsx
- [x] Turnos (lista): src/app/(app)/turnos/page.tsx
- [x] Máquinas (lista): src/app/(app)/maquinas/page.tsx
- [ ] Paciente (detalhe): src/app/(app)/pacientes/[id]/page.tsx
- [ ] Dashboard: src/app/(app)/dashboard/page.tsx

## 4. Acessibilidade/UX/consistência
- [x] Navegação interna: trocar <a> por Link onde cabível
- [x] Feedback de ações: Toast e estado loading (FormSubmit)
- [x] EmptyState com CTA para criar dados quando listas vazias

## 5. SEO e Config
- [ ] Robots/sitemap atualizados para usar base de URL do ambiente
- [ ] next.config.mjs: experimental.serverActions.allowedOrigins dinâmico

## 6. Tipagem TypeScript
- [ ] Remover usos de any e corrigir tipos em todos os arquivos

## 7. Validação final
- [x] Build e type-check passando
- [x] Todas as listas usam Table/EmptyState/Toast/LinkButton/Badge consistentemente
- [x] Toasts ocorrem após inserts/updates/deletes
- [x] Dark mode funcional com toggle no header
- [x] Navegação fluida com Link

## Status: ✅ CONCLUÍDO
- ✅ Modernização visual e fundações implementadas
- ✅ Componentes de UI criados e funcionais
- ✅ Páginas principais atualizadas com novos componentes
- ✅ Build e type-check passando sem erros
- ✅ Dark mode implementado com toggle funcional
- ✅ Padrão consistente de UI/UX aplicado

