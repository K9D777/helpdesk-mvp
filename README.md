# Help Desk MVP

Monorepo com backend NestJS + Prisma + MySQL + frontend React + painel em tempo real.

## Requisitos

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Como rodar

1. Instale dependências:

```bash
npm install
```

2. Suba banco e Redis:

```bash
docker compose up -d
```

3. Configure o ambiente do backend:

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

## Funcionalidades MVP

- Login mockado
- Portal de abertura de chamado
- Fila de chamados
- Atribuição e status
- Comentários públicos/internos
- Dashboard
- Painel em tempo real por Socket.IO
- Seed inicial com filas, categorias e usuários
