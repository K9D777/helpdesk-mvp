import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async notifyTicketUpdate(ticketId: string, userEmail: string | null, message: string) {
    if (!userEmail) {
      return;
    }

    await this.emailService.sendTicketNotification(
      userEmail,
      'Atualização de chamado',
      `Mensagem do Help Desk: ${message}`,
    );

    await this.prisma.ticketAudit.create({
      data: {
        ticketId,
        action: 'notification_sent',
        details: message,
      },
    });
  }
}
