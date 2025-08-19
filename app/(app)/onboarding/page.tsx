import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function OnboardingClinica() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Vincular clínica</h1>

      <div className="card space-y-4">
        <p className="text-sm text-neutral-700">
          Você está autenticado, mas ainda <b>não possui vínculo</b> com nenhuma clínica.
          Para continuar, crie/associe uma clínica ao seu usuário no Supabase.
        </p>

        <ol className="list-decimal pl-5 space-y-3 text-sm text-neutral-800">
          <li>Acesse o <b>SQL Editor</b> do Supabase do seu projeto.</li>
          <li>Rode os comandos abaixo (ajuste o <b>SEU_USER_ID</b> e o <b>CLINICA_ID</b>). Depois volte e atualize a página.</li>
        </ol>

        <pre className="p-3 bg-gray-900 text-gray-100 rounded-md overflow-auto text-xs">
{`-- 1) Descobrir seu usuário (pegar o id certo pelo e-mail usado no login)
select id, email, created_at from auth.users order by created_at desc limit 20;

-- 2) Se já existir uma clínica, pegue o id:
-- select id, nome, created_at from public.clinicas order by created_at desc;

-- (opcional) 2a) Criar clínica se necessário:
insert into public.clinicas (id, nome)
values (gen_random_uuid(), 'Clínica Modelo PE')
returning id;

-- 3) Upsert do seu perfil
insert into public.perfis_usuarios (id, nome, papel)
values ('SEU_USER_ID', 'Administrador', 'ADMIN')
on conflict (id) do update set nome = excluded.nome, papel = excluded.papel;

-- 4) Vínculo usuário ↔ clínica
insert into public.usuarios_clinicas (user_id, clinica_id)
values ('SEU_USER_ID', 'CLINICA_ID')
on conflict (user_id, clinica_id) do nothing;

-- 5) Conferir
select * from public.usuarios_clinicas where user_id = 'SEU_USER_ID';`}
        </pre>

        <div className="flex gap-2">
          <Link href="/pacientes" className="btn">Já vinculei, atualizar</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-md border hover:bg-gray-50">
            Voltar ao Dashboard
          </Link>
        </div>

        <p className="text-xs text-neutral-500">
          Dica: se estiver usando outro e-mail no ambiente de produção, crie o vínculo para <b>esse</b> usuário (id).
        </p>
      </div>
    </div>
  );
}
