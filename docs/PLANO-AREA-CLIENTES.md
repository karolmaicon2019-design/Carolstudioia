# Carol Digital Studio — Área exclusiva para clientes (planejamento)

Status: **não publicada**. A autenticação e o isolamento de dados precisam ser implementados e validados antes de liberar acesso.

## Fluxo proposto
1. Cliente recebe convite individual após um orçamento aprovado; confirma e-mail e define acesso via Supabase Auth.
2. Painel apresenta somente projetos associados ao usuário autenticado: etapa, cronograma estimado, entregáveis e mensagens.
3. Cliente pode visualizar arquivos autorizados e registrar aprovações, com histórico de auditoria.
4. Carol administra vínculos e permissões pelo painel privado.

## Modelo de dados proposto (sem migração aplicada)
- client_memberships: user_id (FK auth.users), lead_id (FK carol_leads), status, created_at, UNIQUE(user_id,lead_id).
- client_projects: id, lead_id, title, stage, expected_date, created_at.
- project_updates: id, project_id, author_id, content, visibility, created_at.
- project_files: id, project_id, storage_path, visibility, created_at.
- project_approvals: id, project_id, approver_id, decision, notes, created_at.

## Segurança obrigatória
- RLS em todas as tabelas expostas; cada SELECT limitado a client_memberships do auth.uid().
- Uploads privados com URLs assinadas de curta duração; sem buckets públicos para contratos e arquivos de clientes.
- Administração validada no servidor, não por e-mail editável no frontend.
- Convites de uso único e revogação de acesso, sem permitir associação de um lead por mera posse do protocolo.
- Sem exposição de dados de outros clientes, tokens ou chaves de serviço.
- Testes com duas contas reais, incluindo tentativas de leitura/escrita cruzadas e links de arquivos expirados.

## Pré-requisitos para implementar
- Aprovação do fluxo de convite e permissões por Carol.
- Revisão da estrutura existente de carol_leads e RLS; migrações incrementais com rollback.
- Testes de segurança antes de habilitar a rota de clientes em produção.

Nenhuma conta, tabela ou rota de cliente foi criada nesta etapa.
