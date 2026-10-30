import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('queues')
export class QueuesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('ADMIN', 'TECHNICIAN')
  async list(@Query('department') department?: string) {
    return this.prisma.queue.findMany({
      where: department ? { department } : undefined,
      orderBy: { name: 'asc' },
    });
  }
}
