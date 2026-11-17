# Carol Digital Studio — implantação Vercel

## Já configurado
- A interface de chat chama a Edge Function `carol-ia-chat` publicada no projeto Supabase `gbyjgvqhnqllmwynefbi`.
- A chave OpenAI permanece somente nos Secrets do Supabase.
- Pedidos são enviados para `/api/leads` e armazenados em `public.carol_leads` pelo servidor Express.
- `/api/admin/leads` é protegida por token de usuário Supabase Auth e `ADMIN_EMAIL`.
- O botão WhatsApp abre mensagem preenchida para +55 47 99199-8281. Envio exige confirmação do usuário.

## Passos obrigatórios para funcionar na Vercel
1. Crie conta na Vercel e importe o conteúdo DESTA pasta como raiz do projeto (Framework Preset: Other).
2. Adicione variáveis de ambiente (Production, Preview):
   - `SUPABASE_URL=https://gbyjgvqhnqllmwynefbi.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` (obter somente no painel Supabase; secreto, jamais no frontend)
   - `ADMIN_EMAIL` (seu e-mail administrativo, sem espaços)
3. Execute deploy. A Vercel instala dependências de `package.json` e expõe `api/index.js` como função serverless.
4. Crie sua conta administrativa no Supabase Authentication e use o mesmo e-mail em `ADMIN_EMAIL`.
5. Para entrar no painel `/admin.html`, forneça URL do projeto, chave pública publishable ou legacy anon e suas credenciais Supabase Auth. Não use a service_role no navegador.
6. Teste: conversar com IA, salvar pedido, verificar no banco, entrar no painel, atualizar preço e abrir link WhatsApp.

## Atenção
- A Edge Function foi publicada, mas a chamada real à OpenAI não foi testada devido a restrições de acesso à rede do ambiente de criação.
- A função pública possui cotas iniciais por IP e global. Antes de tráfego alto, adicionar Turnstile e monitoramento de consumo e logs.
- A limitação de pedidos compartilha cotas com a IA e deve ser refinada antes de lançamento público em escala.
- A página do cliente ainda não oferece login e acompanhamento da proposta. O painel permite que a Carol registre preços e respostas, mas não envia automaticamente ao cliente.
- Não publique segredos em arquivos HTML/JS ou em Git.


## Área para recrutadores
O mesmo site possui `/recrutadores.html`, acessível pelo botão “Para recrutadores” no menu principal. Nessa página há um botão “Ver meu currículo” que leva à seção de currículo. Preencher formação e experiências reais antes de divulgar.


## Currículo integrado (novembro de 2026)
A página `recrutadores.html#curriculo` contém experiências, formação e cursos extraídos dos PDFs enviados. Foram omitidos CPF, endereço residencial, data de nascimento, idade, raça/cor, orientação sexual e pretensão salarial para proteger a privacidade. Confirme situação atual de emprego, escolaridade e curso de Marketing Digital antes de publicar.
