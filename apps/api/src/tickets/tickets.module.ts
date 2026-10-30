import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { TicketGateway } from './ticket.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../common/services/email.service';
import { NotificationService } from '../common/services/notification.service';

@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketGateway, EmailService, NotificationService],
})
export class TicketsModule {}
