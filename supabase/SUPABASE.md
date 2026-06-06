# Fluxo recomendado no app

1. Usuário cria conta via Supabase Auth enviando o nome em `options.data.name`.
2. O trigger `trg_handle_new_user` cria automaticamente o perfil na tabela `users`.
3. Ao criar grupo, inserir em `groups` com `created_by = auth.uid()`.
4. O trigger do banco adiciona automaticamente o criador em `group_members` como `owner`.
5. Para convidar participantes, o dono do grupo insere usuários em `group_members`.
6. Para lançar despesa, inserir em `expenses` com:
   - `group_id` do grupo
   - `paid_by = auth.uid()`
   - `amount`, `description`
   - `receipt_url` (Caminho do recibo no Storage, ex: `public/nome_arquivo.jpg`, quando houver)

## Storage (Armazenamento de Recibos)

O app utiliza o Supabase Storage para guardar as fotos dos recibos:
- **Bucket:** `receipts`
- **Visibilidade:** Privado (Private)
- **Segurança (RLS):** 
  - Somente usuários **autenticados** podem visualizar e fazer upload de arquivos no bucket `receipts`.
  - Apenas o dono do arquivo (quem enviou) pode alterar ou excluir o recibo.
- **Acesso no Frontend:** Como o bucket é privado, o app não deve tentar usar `getPublicUrl`. Para exibir a imagem, o ideal é usar `supabase.storage.from('receipts').createSignedUrl('caminho_do_arquivo', 60)` para gerar uma URL temporária ou fazer o download do arquivo autenticado.

## Versionamento obrigatório

Sempre que houver mudança estrutural no banco:

1. Atualizar o arquivo `supabase/schema.sql`.
2. Atualizar o arquivo `supabase/rls.sql` quando houver ajuste em permissões/policies de segurança.
3. Registrar no commit a alteração de banco (ex.: `feat(db): adiciona coluna x em expenses`).

Assim, toda a equipe sabe exatamente qual SQL foi aplicado no Supabase.
