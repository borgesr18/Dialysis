# Hemodiálise — MVP

Stack: **Next.js 14 (App Router) + TypeScript + TailwindCSS + Supabase (Auth + PostgREST + RLS)**

## Como rodar

1) Crie um projeto no **Supabase** e copie `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para `.env.local`.
2) No Supabase, rode o arquivo **`supabase-schema.sql`** no SQL Editor para criar tabelas e políticas RLS.
3) Faça o seed manual (no final do SQL) colocando seu `auth.uid()` como `perfis_usuarios.id` e criando `usuarios_clinicas`.
4) Instale dependências e rode:
```bash
pnpm i
pnpm dev
```
5) Acesse `/login` e entre via **link mágico** (OTP).

> **Observações**
- O sistema usa **RLS**: só enxerga dados da(s) clínica(s) que você pertence (tabela `usuarios_clinicas`).
- O **CitySelect** carrega os municípios de PE pela API do **IBGE** com fallback local.
- Estrutura pronta para evoluir com **Prescrição**, **Serologias** e **Impressão de escala**.

## Estrutura
```
hemodialise-mvp/
├─ app/
│  ├─ (auth)/login/page.tsx
│  ├─ (app)/layout.tsx
│  ├─ (app)/dashboard/page.tsx
│  ├─ (app)/pacientes/{page.tsx,_form.tsx}
│  ├─ (app)/salas/page.tsx
│  ├─ (app)/turnos/page.tsx
│  └─ (app)/agenda/page.tsx
├─ src/components/CitySelect.tsx
├─ src/lib/{supabase-server.ts,supabase-browser.ts,get-clinic.ts}
├─ src/styles/globals.css
├─ supabase-schema.sql
├─ package.json, tsconfig.json, tailwind.config.ts, postcss.config.js
└─ .env.example
```

---
Gerado em 2025-08-18T17:44:49.706407.
