import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from '../prisma/prisma.service';
import { TicketGateway } from './ticket.gateway';
import { NotificationService } from '../common/services/notification.service';
import { buildUploadPath } from '../common/utils/upload.util';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private ticketGateway: TicketGateway,
    private notificationService: NotificationService,
  ) {}

  private async recordAudit(
    ticketId: string,
    userId: string | null,
    action: string,
    details?: string,
    previousValue?: string | null,
    newValue?: string | null,
  ) {
    await this.prisma.ticketAudit.create({
      data: {
        ticketId,
        userId,
        action,
        details: details || null,
        previousValue: previousValue ?? null,
        newValue: newValue ?? null,
      },
    });
  }

  async createTicket(data: any) {
    const requesterId = data.requesterId;

    if (!requesterId) {
      throw new BadRequestException('O id do solicitante é obrigatório');
    }

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
          connect: { id: requesterId },
        },
        queue: data.queueId ? { connect: { id: data.queueId } } : undefined,
        category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      },
      include: {
        requester: true,
        assignee: true,
        queue: true,
        category: true,
        comments: { include: { user: true } },
        audits: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        attachments: true,
      },
    });

    await this.recordAudit(ticket.id, data.userId || null, 'ticket_created', `Chamado ${ticket.protocol} criado`, null, ticket.status);
    await this.notificationService.notifyTicketUpdate(ticket.id, ticket.requester.email, `Seu chamado ${ticket.protocol} foi aberto com sucesso.`);

    this.ticketGateway.emitNewTicket(ticket);
    this.ticketGateway.emitDashboardUpdate({ type: 'ticket:new', ticket });

    return ticket;
  }

  async getTickets(filters?: { status?: string; queueId?: string; priority?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.queueId) where.queueId = filters.queueId;
    if (filters?.priority) where.priority = filters.priority;

    return this.prisma.ticket.findMany({
      where,
      include: {
        requester: true,
        assignee: true,
        queue: true,
        category: true,
        comments: { include: { user: true } },
        audits: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        attachments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTicketById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: true,
        assignee: true,
        queue: true,
        category: true,
        comments: { include: { user: true } },
        audits: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        attachments: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    return ticket;
  }

  async updateStatus(id: string, status: string, userId?: string) {
    const current = await this.prisma.ticket.findUnique({ where: { id } });

    if (!current) {
      throw new NotFoundException('Chamado não encontrado');
    }

    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        requester: true,
        assignee: true,
        queue: true,
        category: true,
        comments: { include: { user: true } },
        audits: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        attachments: true,
      },
    });

    await this.recordAudit(
      id,
      userId || null,
      'status_updated',
      `Status alterado de ${current.status} para ${status}`,
      current.status,
      status,
    );

    await this.notificationService.notifyTicketUpdate(
      id,
      ticket.requester.email,
      `Seu chamado ${ticket.protocol} mudou para ${status}.`,
    );

    this.ticketGateway.emitTicketUpdated(ticket);
    this.ticketGateway.emitDashboardUpdate({ type: 'ticket:updated', ticket });

    return ticket;
  }

  async addComment(ticketId: string, userId: string, body: string, isInternal = false) {
    const ticket = await this.getTicketById(ticketId);

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

    await this.recordAudit(
      ticketId,
      userId,
      'comment_added',
      isInternal ? 'Comentário interno adicionado' : 'Comentário público adicionado',
      null,
      body,
    );

    await this.notificationService.notifyTicketUpdate(
      ticketId,
      ticket.requester.email,
      `Novo comentário no chamado ${ticket.protocol}.`,
    );

    const updatedTicket = await this.getTicketById(ticketId);
    this.ticketGateway.emitTicketUpdated(updatedTicket);
    this.ticketGateway.emitDashboardUpdate({ type: 'comment:add', ticket: updatedTicket });

    return comment;
  }

  async uploadAttachment(ticketId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Arquivo ausente');
    }

    const ticket = await this.getTicketById(ticketId);
    const destination = buildUploadPath(ticketId, file.originalname);
    fs.writeFileSync(destination, file.buffer);

    const attachment = await this.prisma.ticketAttachment.create({
      data: {
        ticketId: ticket.id,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storagePath: destination,
      },
    });

    await this.recordAudit(ticketId, null, 'attachment_uploaded', `Arquivo anexado: ${file.originalname}`);
    return attachment;
  }

  async listAttachments(ticketId: string) {
    const ticket = await this.getTicketById(ticketId);
    return this.prisma.ticketAttachment.findMany({
      where: { ticketId: ticket.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDashboardSummary() {
    const [total, newTickets, inProgress, resolved, queueStats, statusBreakdown, priorityBreakdown] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { status: 'NEW' } }),
      this.prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.queue.findMany({ include: { _count: { select: { tickets: true } } } }),
      this.prisma.ticket.groupBy({ by: ['status'], _count: { status: true } }),
      this.prisma.ticket.groupBy({ by: ['priority'], _count: { priority: true } }),
    ]);

    return {
      total,
      newTickets,
      inProgress,
      resolved,
      openByQueue: queueStats.map((queue) => ({
        name: queue.name,
        total: queue._count.tickets,
      })),
      statusBreakdown: statusBreakdown.map((row) => ({
        status: row.status,
        total: row._count.status,
      })),
      priorityBreakdown: priorityBreakdown.map((row) => ({
        priority: row.priority,
        total: row._count.priority,
      })),
    };
  }
}
