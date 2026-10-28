import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  async getTickets() {
    return this.ticketsService.getTickets();
  }

  @Get('summary')
  async getSummary() {
    return this.ticketsService.getDashboardSummary();
  }

  @Get(':id')
  async getTicket(@Param('id') id: string) {
    return this.ticketsService.getTicketById(id);
  }

  @Post()
  async createTicket(@Body() body: any) {
    return this.ticketsService.createTicket(body);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ticketsService.updateStatus(id, body.status);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() body: { userId: string; body: string; isInternal?: boolean },
  ) {
    return this.ticketsService.addComment(
      id,
      body.userId,
      body.body,
      body.isInternal || false,
    );
  }
}
