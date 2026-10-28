import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketGateway } from './ticket.gateway';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private ticketGateway: TicketGateway,
  ) {}

  async createTicket(data: any) {
    const ticket = await this.prisma.ticket.create({
      data: {
        protocol: `HD-${Date.now()}`,
        title: data.title,
        description: data.description,
        status: data.status || 'NEW',
        source: data.source || 'PORTAL',
        priority: data.priority || 'MEDIA',
        urgency: Number(data.urgency || 2),
        impact: Number(data.impact || 2),
        sector: data.sector || null,
        location: data.location || null,
        requester: {
          connect: { id: data.requesterId },
        },
        queue: data.queueId ? { connect: { id: data.queueId } } : undefined,
        category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      },
      include: {
        requester: true,
        queue: true,
        category: true,
        comments: { include: { user: true } },
      },
    });

    this.ticketGateway.emitNewTicket(ticket);
    this.ticketGateway.emitDashboardUpdate({ type: 'ticket:new', ticket });

    return ticket;
  }

  async getTickets() {
    return this.prisma.ticket.findMany({
      include: {
        requester: true,
        assignee: true,
        queue: true,
        category: true,
        comments: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketById(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: true,
        assignee: true,
        queue: true,
        category: true,
        comments: { include: { user: true } },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        requester: true,
        assignee: true,
        queue: true,
        category: true,
        comments: { include: { user: true } },
      },
    });

    this.ticketGateway.emitTicketUpdated(ticket);
    this.ticketGateway.emitDashboardUpdate({ type: 'ticket:updated', ticket });

    return ticket;
  }

  async addComment(ticketId: string, userId: string, body: string, isInternal = false) {
    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        body,
        isInternal,
      },
      include: {
        user: true,
      },
    });

    const ticket = await this.getTicketById(ticketId);
    this.ticketGateway.emitTicketUpdated(ticket);
    this.ticketGateway.emitDashboardUpdate({ type: 'comment:add', ticket });

    return comment;
  }

  async getDashboardSummary() {
    const [total, newTickets, inProgress, resolved, openByQueue] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { status: 'NEW' } }),
      this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.queue.findMany({
        include: {
          _count: { select: { tickets: true } },
        },
      }),
    ]);

    return {
      total,
      newTickets,
      inProgress,
      resolved,
      openByQueue: openByQueue.map((queue) => ({
        name: queue.name,
        total: queue._count.tickets,
      })),
    };
  }
}
