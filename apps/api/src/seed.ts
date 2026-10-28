import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@helpdesk.local' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@helpdesk.local',
      password: 'admin123',
      department: 'TI',
      role: 'ADMIN',
    },
  });

  const suporte = await prisma.user.upsert({
    where: { email: 'suporte@helpdesk.local' },
    update: {},
    create: {
      name: 'Técnico Suporte',
      email: 'suporte@helpdesk.local',
      password: 'suporte123',
      department: 'TI',
      role: 'TECHNICIAN',
    },
  });

  const colaborador = await prisma.user.upsert({
    where: { email: 'colaborador@helpdesk.local' },
    update: {},
    create: {
      name: 'Colaborador',
      email: 'colaborador@helpdesk.local',
      password: 'colaborador123',
      department: 'Operações',
      role: 'REQUESTER',
    },
  });

  const infra = await prisma.queue.upsert({
    where: { name: 'Infraestrutura' },
    update: {},
    create: { name: 'Infraestrutura', department: 'TI' },
  });

  const helpdesk = await prisma.queue.upsert({
    where: { name: 'Help Desk' },
    update: {},
    create: { name: 'Help Desk', department: 'TI' },
  });

  await prisma.category.upsert({
    where: { name: 'Acesso' },
    update: {},
    create: { name: 'Acesso' },
  });

  await prisma.category.upsert({
    where: { name: 'Hardware' },
    update: {},
    create: { name: 'Hardware' },
  });

  await prisma.category.upsert({
    where: { name: 'Software' },
    update: {},
    create: { name: 'Software' },
  });

  await prisma.slaRule.upsert({
    where: { id: 'default-priority-1' },
    update: {},
    create: {
      id: 'default-priority-1',
      name: 'Prioridade Alta',
      priority: 'ALTA',
      responseMinutes: 60,
      resolutionMinutes: 240,
      active: true,
    },
  });

  await prisma.ticket.createMany({
    data: [
      {
        protocol: 'HD-1001',
        title: 'Notebook sem acesso ao e-mail',
        description: 'Usuário não consegue entrar em outlook corporativo.',
        status: 'NEW',
        source: 'PORTAL',
        priority: 'ALTA',
        urgency: 3,
        impact: 3,
        sector: 'Operações',
        location: 'Predio A',
        requesterId: colaborador.id,
        assigneeId: suporte.id,
        queueId: helpdesk.id,
      },
      {
        protocol: 'HD-1002',
        title: 'Impressora não responde',
        description: 'A impressora da área contábil está offline.',
        status: 'IN_PROGRESS',
        source: 'MANUAL',
        priority: 'MEDIA',
        urgency: 2,
        impact: 2,
        sector: 'Financeiro',
        location: 'Predio B',
        requesterId: colaborador.id,
        assigneeId: suporte.id,
        queueId: infra.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed concluído');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
