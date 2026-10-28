import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getDashboard() {
    const totalTickets = await this.prisma.ticket.count();
    const newTickets = await this.prisma.ticket.count({ where: { status: 'NEW' } });
    const inProgress = await this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } });
    const resolved = await this.prisma.ticket.count({ where: { status: 'RESOLVED' } });

    const queueStats = await this.prisma.queue.findMany({
      include: {
        _count: { select: { tickets: true } },
      },
    });

    return {
      totalTickets,
      newTickets,
      inProgress,
      resolved,
      queueStats: queueStats.map((item) => ({
        name: item.name,
        total: item._count.tickets,
      })),
    };
  }
}
