# Fluxo recomendado no app

1. Usuário cria conta via Supabase Auth.
2. Após cadastro/login, app cria/atualiza perfil na tabela `users` com `id = auth.uid()`.
3. Ao criar grupo, inserir em `groups` com `created_by = auth.uid()`.
4. O trigger do banco adiciona automaticamente o criador em `group_members` como `owner`.
5. Para convidar participantes, o dono do grupo insere usuários em `group_members`.
6. Para lançar despesa, inserir em `expenses` com:
   - `group_id` do grupo
   - `paid_by = auth.uid()`
   - `amount`, `description`
   - `receipt_url` (URL pública do recibo no Storage, quando houver)

## Versionamento obrigatório

Sempre que houver mudança estrutural no banco:

1. Atualizar o arquivo `supabase/schema.sql`.
2. Atualizar o arquivo `supabase/rls.sql` quando houver ajuste em permissões/policies de segurança.
3. Registrar no commit a alteração de banco (ex.: `feat(db): adiciona coluna x em expenses`).

Assim, toda a equipe sabe exatamente qual SQL foi aplicado no Supabase.