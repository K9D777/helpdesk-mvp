import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CommentDto } from './dto/comment.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TicketsService } from './tickets.service';

@UseGuards(AuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @Roles('ADMIN', 'TECHNICIAN')
  async getTickets() {
    return this.ticketsService.getTickets();
  }

  @Get('summary')
  @Roles('ADMIN', 'TECHNICIAN')
  async getSummary() {
    return this.ticketsService.getDashboardSummary();
  }

  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN', 'REQUESTER')
  async getTicket(@Param('id') id: string) {
    return this.ticketsService.getTicketById(id);
  }

  @Post()
  @Roles('ADMIN', 'TECHNICIAN', 'REQUESTER')
  async createTicket(@Body() body: CreateTicketDto, @CurrentUser() user: any) {
    return this.ticketsService.createTicket({
      ...body,
      requesterId: body.requesterId || user.sub,
    });
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'TECHNICIAN')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.ticketsService.updateStatus(id, body.status);
  }

  @Post(':id/comments')
  @Roles('ADMIN', 'TECHNICIAN', 'REQUESTER')
  async addComment(
    @Param('id') id: string,
    @Body() body: CommentDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.addComment(id, user.sub, body.body, body.isInternal || false);
  }
}
