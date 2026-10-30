import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('sla')
  @Roles('ADMIN', 'TECHNICIAN')
  async getSlaSummary() {
    const [tickets, slaRules] = await Promise.all([
      this.prisma.ticket.findMany({
        include: {
          requester: true,
          assignee: true,
          queue: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.slaRule.findMany({ where: { active: true } }),
    ]);

    const rulesByPriority = Object.fromEntries(
      slaRules.map((rule) => [rule.priority, rule]),
    );

    const now = Date.now();

    const metrics = tickets.map((ticket) => {
      const createdAt = new Date(ticket.createdAt).getTime();
      const hoursOpen = (now - createdAt) / (1000 * 60 * 60);
      const slaRule = rulesByPriority[ticket.priority] || { responseMinutes: 240, resolutionMinutes: 480 };
      const responseLimitHours = slaRule.responseMinutes / 60;
      const resolutionLimitHours = slaRule.resolutionMinutes / 60;
      const responseDelayed = hoursOpen > responseLimitHours && ticket.status === 'NEW';
      const resolutionDelayed = hoursOpen > resolutionLimitHours && ticket.status !== 'RESOLVED';

      return {
        ticketId: ticket.id,
        protocol: ticket.protocol,
        title: ticket.title,
        priority: ticket.priority,
        status: ticket.status,
        hoursOpen: Number(hoursOpen.toFixed(2)),
        responseLimitHours: Number(responseLimitHours.toFixed(2)),
        resolutionLimitHours: Number(resolutionLimitHours.toFixed(2)),
        responseDelayed,
        resolutionDelayed,
        assignee: ticket.assignee?.name || 'Não atribuído',
      };
    });

    return {
      totalTickets: metrics.length,
      overdueResponse: metrics.filter((item) => item.responseDelayed).length,
      overdueResolution: metrics.filter((item) => item.resolutionDelayed).length,
      tickets: metrics,
    };
  }

  @Get('productivity')
  @Roles('ADMIN', 'TECHNICIAN')
  async getProductivitySummary() {
    const users = await this.prisma.user.findMany({
      include: {
        assigned: true,
      },
      orderBy: { name: 'asc' },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      department: user.department,
      role: user.role,
      assignedTickets: user.assigned.length,
      resolvedTickets: user.assigned.filter((ticket) => ticket.status === 'RESOLVED').length,
      inProgressTickets: user.assigned.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
    }));
  }
}
