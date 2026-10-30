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

1. Instale dependências:

```bash
npm install
```

2. Suba banco e Redis:

```bash
docker compose up -d
```

3. Configure o ambiente:

```bash
cp apps/api/.env.example apps/api/.env
```

4. Gere o Prisma e aplique o schema:

```bash
npm run db:push
npm run seed
```

5. Inicie o monorepo:

```bash
npm run dev
```

- API: http://localhost:3001
- Frontend: http://localhost:5173

## Login de demo

- Email: admin@helpdesk.local
- Senha: admin123

## Observações de produção

- Configure SMTP para enviar notificação de e-mail.
- Ajuste as credenciais do banco em `apps/api/.env`.
- Para anexos, a pasta `uploads/` será criada automaticamente no projeto.
