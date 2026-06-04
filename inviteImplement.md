# Implementação de Convites (Issues #12 e #35)

Este documento detalha o passo a passo para implementar o sistema de convites de grupos, cobrindo a passagem de ID, geração de códigos e o compartilhamento.

## 1. Banco de Dados e Geração de Código 
 - **Alteração de Schema:** Adicionar a coluna `invite_code` (única) na tabela `groups` em `supabase/schema.sql`. ✅
 - **Geração:** Ao criar um novo grupo (via app ou trigger no Supabase), gerar um código alfanumérico curto (ex: 6 a 8 caracteres) e salvar na coluna `invite_code`. Isso facilita o compartilhamento verbal ou digitação manual em comparação ao UUID longo. ✅
- **Serviços:** 
  - Atualizar os tipos em `database.types.ts`. ✅
  - Adicionar em `services/groups.ts` uma função para buscar os dados de um grupo (nome e código de convite) pelo `groupId`.
  - Criar função `joinGroup(inviteCode)` para vincular um usuário autenticado ao grupo (tabela `group_members`).

## 2. Tela de Convite (`app/groups/[groupId]/invite.tsx`)
- **Rota e Estado:** O `groupId` já é recuperado da rota (`useLocalSearchParams`). Usar esse ID para carregar o nome do grupo e seu respectivo `invite_code` do backend.
- **Interface Gráfica (UI):**
  - Mostrar em destaque o Código de Convite do grupo.
  - **Botão "Copiar":** Utilizar a biblioteca `expo-clipboard` para permitir que o usuário copie o código facilmente.
  - **Botão "Compartilhar":** Utilizar `expo-sharing` (ou a API `Share` do React Native) para abrir o diálogo nativo do sistema e enviar uma mensagem amigável contendo o código do grupo (e futuramente um link). Ex: *"Venha participar do grupo {Nome do Grupo}. Use o código: {Código}"*.

## 3. Tela de Entrada no Grupo
- Modificar a tela de listagem de grupos (`groups.tsx`) ou criar um modal específico para adicionar a funcionalidade "Entrar em um grupo existente".
- O usuário insere o `invite_code` em um campo de texto.
- O app chama a função `joinGroup` com o código fornecido, que faz a validação e, caso seja válido, insere o usuário no grupo como membro.

## 4. Deep Linking e Links de Acesso (Próximos Passos)
- Configurar o scheme do app no `app.json` (caso ainda não esteja) e o Expo Router para lidar com links universais / deep links (ex: `app://invite/[invite_code]`).
- Quando o usuário abrir um link de convite e já tiver o app, capturar o código, validar e perguntar "Deseja entrar no grupo?".
