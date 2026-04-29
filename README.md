# Especificação do Trabalho Prático Final: Desenvolvimento de Aplicação Mobile

**Equipe:** 2 a 3 alunos

## IMPORTANTE

**Adicionem o login do professor (@alexkutzke) no repositório github da equipe, para que o acompanhamento dos commits e do desenvolvimento possa ocorrer.**

## 1. Visão Geral e Escopo do Projeto

O trabalho prático final consiste no planejamento, prototipação e desenvolvimento de um aplicativo mobile funcional utilizando o ecossistema **React Native e Expo**. O objetivo é consolidar os conhecimentos de arquitetura de front-end, integração com back-end em nuvem (BaaS) e acesso a recursos nativos do dispositivo.

O escopo deste trabalho prático consiste na **gestão e divisão de contas financeiras compartilhadas**. O sistema deve permitir que usuários autenticados criem grupos de despesas (como "República", "Viagem" ou "Churrasco") e adicionem outros participantes. Dentro de cada grupo, os membros poderão registrar compras informando o valor total, a descrição e quem realizou o pagamento. O principal objetivo da aplicação é processar e cruzar esses dados para calcular e exibir o balanço financeiro do grupo, determinando de forma automatizada os saldos de cada participante — ou seja, quem pagou mais do que a sua cota e quem possui valores pendentes a acertar com os demais membros.

## 2. Requisitos Técnicos Obrigatórios (Tema: App de Divisão de Despesas)

Para que o trabalho seja aprovado, o código-fonte deve atender integralmente aos seguintes requisitos técnicos baseados no escopo de um aplicativo de divisão de contas:

### 2.1. Arquitetura de Navegação e Interface (UI/UX)
* **Navegação Híbrida:** Utilizar **Tabs** para as seções primárias (ex: "Meus Grupos", "Atividade/Extrato", "Perfil") e **Stacks** para detalhamento (ex: Clicar em um grupo abre a tela com a lista de despesas daquele grupo).
* **Modais:** O formulário de "Adicionar Nova Despesa" deve obrigatoriamente abrir em formato Modal sobrepondo a tela do grupo.
* **Tratamento de Estados Visuais:** * **Empty States:** Se o usuário não faz parte de nenhum grupo, a tela inicial deve mostrar uma ilustração e um botão amigável "Criar meu primeiro grupo".
  * **Loading States:** Ao salvar uma despesa ou calcular saldos, botões devem apresentar *spinners* de carregamento.
* As listas de grupos e despesas (`FlatList`) devem implementar a funcionalidade de *Pull-to-Refresh* (arrastar para atualizar).

### 2.2. Autenticação e Estado Global
* Login e cadastro gerenciados nativamente pelo **Supabase Auth** (ou Firebase).
* Utilizar a **Context API** para armazenar os dados do usuário autenticado e seu saldo total consolidado.
* **Proteção de Rotas:** O aplicativo deve bloquear o acesso às abas internas. Se não houver token de sessão ativo, o usuário deve ser forçado a permanecer na tela de Login.

### 2.3. Modelagem de Banco de Dados (BaaS) e Regras de Negócio
O banco de dados deve ser estruturado para suportar a lógica de divisão. É obrigatória a existência de, no mínimo, **4 tabelas/coleções interligadas**:
1.  **Usuários (`users`):** Dados de perfil gerados no cadastro.
2.  **Grupos (`groups`):** ID, nome do grupo (ex: "Churrasco", "República"), data de criação.
3.  **Membros do Grupo (`group_members`):** Tabela associativa vinculando quais Usuários pertencem a quais Grupos.
4.  **Despesas (`expenses`):** Tabela contendo qual usuário pagou, o valor total, a descrição (ex: "Supermercado"), o grupo ao qual pertence e a foto do recibo (URL).

* **Regras de Negócio (Lógica):** O aplicativo deve ser capaz de ler as despesas de um grupo e calcular o balanço (quem pagou mais do que devia e quem está devendo).
* **Segurança Restritiva (RLS):** É obrigatória a configuração de *Row Level Security*. Um usuário logado **só pode visualizar, adicionar despesas ou ver membros** de um Grupo se o seu ID constar na tabela `group_members` daquele grupo específico.

### 2.4. Acesso a Recursos Nativos (Hardware/OS)
A aplicação deve utilizar **pelo menos dois (2) recursos nativos diferentes**, que devem estar obrigatoriamente atrelados à lógica de divisão de despesas:

1. **Câmera ou Galeria de Imagens (`expo-image-picker`):** * *Justificativa:* Ao cadastrar uma nova despesa no grupo, o usuário deve ter a opção de tirar uma foto da nota fiscal/recibo para comprovação.
   * *Integração DB:* A imagem deve ser enviada para o *Supabase Storage* e a URL pública gerada deve ser salva na coluna `receipt_url` da tabela de Despesas.
2. **Compartilhamento Nativo (`expo-sharing` ou `Share` do React Native):**
   * *Justificativa:* Facilitar o convite de novos membros para o grupo.
   * *Integração DB:* Na tela de detalhes do Grupo, deve haver um botão "Convidar Amigo". Ao clicar, o app aciona a gaveta de compartilhamento nativa do celular (WhatsApp, SMS, etc.) enviando uma mensagem padrão com o "Código do Grupo" ou um Deep Link gerado a partir do ID do grupo no banco de dados.

## 3. Dinâmica de Avaliação Contínua (Versionamento via Git)

O processo de **Engenharia de Software** será avaliado. Para isso, o desenvolvimento deve ocorrer durante as semanas estipuladas, com monitoramento ativo do repositório.

### Regras do Repositório:
1. **Mensagens Semânticas:** Os commits devem ser descritivos e pontuais (Ex: `feat: adiciona modal de nova despesa`, `fix: corrige validacao de campos vazios`, `chore: atualiza dependencias`).
2. **Distribuição de Trabalho:** O histórico (`Insights > Contributors`) deve evidenciar a participação ativa de todos os membros do grupo na escrita de código.
3. **Evite commits densos:** Projetos que apresentarem mais de 70% do código submetido no repositório em 2 ou 3 commits maciços na última semana sofrerão penalidade de até 100% da nota na rubrica de Processo de Engenharia.

### Cronograma de Sprints (Sugestão de Organização da Equipe)
* **Semana 1:** Configuração do Expo, modelagem das tabelas no Supabase, criação da tela de Login/Cadastro e configuração do Contexto.
* **Semana 2:** Criação da navegação base (Tabs/Stacks), implementação do CRUD da entidade principal e regras de RLS no banco.
* **Semana 3:** Implementação de lógicas de negócio adicionais, tratamento de erros, formatação de listas (pull-to-refresh) e Integração Nativa 1.
* **Semana 4:** Integração Nativa 2, polimento de UI (Empty/Loading states), revisão final do código e preparação para a defesa.

## 4. Defesa do Projeto (Arguição Final)

No dia de apresentação, as equipes terão **15 a 20 minutos** com o professor.

1. **Pitch e Demonstração (5 min):** A equipe apresentará o fluxo principal do aplicativo rodando (dispositivo físico ou emulador).
2. **Estrutura Backend (3 min):** A equipe mostrará o painel do Supabase/Firebase, comprovando a relação das tabelas e a eficácia das regras de segurança estabelecidas.
3. **Inspeção de Código (10 min):** * O professor solicitará que a equipe abra arquivos específicos do código-fonte na IDE e fará perguntas sobre a implementação.
   * **Importante:** Todos os membros da equipe deve ser capazes de explicar qualquer trecho de código da aplicação.

## 5. Distribuição de Pontos (Total: 100 Pontos)

| Critério de Avaliação | Detalhamento | Pontuação Máx. |
| :--- | :--- | :--- |
| **I. Funcionalidade e Arquitetura Front-end** | Qualidade do código React Native, correta divisão de componentes, navegação sem quebras, tratamento de estados (Loading/Empty/Error) e validação de forms. | **30 pts** |
| **II. Backend e Complexidade de Dados** | Modelagem relacional correta (mínimo 4 tabelas), implementação de CRUD completo e políticas rigorosas de segurança de dados (RLS). | **15 pts** |
| **III. Integrações Nativas** | Implementação robusta e com tratamento de permissões de pelo menos 2 recursos nativos integrados ao fluxo do aplicativo. | **15 pts** |
| **IV. Engenharia e Versionamento** | Histórico de commits consistente ao longo das 4 semanas, mensagens adequadas, comprovação de trabalho em equipe no repositório. | **15 pts** |
| **V. Defesa** | (*Nota individual*) Domínio sobre o código-fonte desenvolvido, clareza técnica na resposta às perguntas do professor durante a arguição. | **25 pts** |


