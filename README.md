# Help Desk MVP

Monorepo do MVP do sistema de help desk corporativo em Node.js + NestJS + React + MySQL.

## Funcionalidades

- Login com autenticação JWT
- Gestão de filas e categorias
- Abertura, acompanhamento e atualização de chamados
- Comentários públicos e internos
- Dashboard de métricas
- Relatórios de SLA e produtividade
- Auditoria de alterações
- Notificações por e-mail via SMTP
- Upload de anexos em pasta local

## Requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose
- MySQL

## Como rodar

1. Instale dependências do monorepo:

```bash
npm install
```

2. Crie o ambiente da API:

```bash
cp apps/api/.env.example apps/api/.env
```

3. Ajuste as variáveis de ambiente no arquivo `apps/api/.env`:

```env
DATABASE_URL="mysql://app:app123@localhost:3306/helpdesk"
JWT_SECRET="helpdesk-dev-secret"
PORT=3001
FRONTEND_URL="http://localhost:5173"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@empresa.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="Help Desk <seu-email@empresa.com>"
```

4. Inicie o banco com Docker:

```bash
docker compose up -d
```

5. Gere o Prisma e aplique o schema:

```bash
cd apps/api
npx prisma generate
npx prisma db push
npm run seed
```

6. Inicie a API:

```bash
cd apps/api
npm run dev
```

7. Inicie o frontend:

```bash
cd apps/web
npm run dev
```

Acesse:
- API: http://localhost:3001
- Frontend: http://localhost:5173

## Login de demonstração

- Email: admin@helpdesk.local
- Senha: admin123

## Checklist de validação rápida

### 1. Autenticação
- [ ] Logar com admin@helpdesk.local / admin123
- [ ] Verificar token salvo no localStorage
- [ ] tentar acessar rota protegida sem token
- [ ] confirmar retorno 401/403

### 2. Fluxo de chamados
- [ ] criar chamado pelo frontend
- [ ] confirmar que o chamado apareceu na fila
- [ ] selecionar o ticket
- [ ] alterar status para "IN_PROGRESS"
- [ ] alterar status para "RESOLVED"
- [ ] validar atualização em tempo real

### 3. Comentários
- [ ] adicionar comentário público
- [ ] adicionar comentário interno
- [ ] validar exibição no painel do chamado

### 4. Dashboard e relatórios
- [ ] validar `/dashboard`
- [ ] validar `/reports/sla`
- [ ] validar `/reports/productivity`
- [ ] verificar contadores e totais

### 5. Anexos
- [ ] enviar arquivo via `/tickets/:id/attachments`
- [ ] verificar arquivo salvo em `uploads/<ticketId>/`
- [ ] listar anexos via `/tickets/:id/attachments`

### 6. E-mail
- [ ] configurar SMTP corretamente
- [ ] atualizar status ou comentar ticket
- [ ] verificar envio de e-mail
- [ ] confirmar fallback quando SMTP não está configurado

### 7. Produção
- [ ] ajustar `.env` com credenciais reais
- [ ] rodar `npm run build` da API
- [ ] validar servidor com `npm run start`
- [ ] revisar logs e estrutura de uploads

## Endpoints importantes

- `POST /auth/login`
- `GET /tickets`
- `POST /tickets`
- `PATCH /tickets/:id/status`
- `POST /tickets/:id/comments`
- `POST /tickets/:id/attachments`
- `GET /tickets/:id/attachments`
- `GET /dashboard`
- `GET /reports/sla`
- `GET /reports/productivity`

## Observações de produção

- Configure SMTP para enviar notificação de e-mail.
- Ajuste as credenciais do banco em `apps/api/.env`.
- Para anexos, a pasta `uploads/` será criada automaticamente no projeto.
- O sistema usa `JWT_SECRET` para autenticação; use um valor forte em produção.
- Considere usar armazenamento externo para anexos em ambiente real (S3/Blob Storage).

## Estrutura do projeto

```text
apps/
  api/
    src/
    prisma/
  web/
    src/
```

## Dicas finais

- Use `npm run seed` para popular usuários e tickets iniciais.
- Para produção, mude o banco para ambiente externo e proteja as credenciais.
- Para escala real, considere adotar autenticação SSO/LDAP e armazenamento público de anexos.
