import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('queues')
export class QueuesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    return this.prisma.queue.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
