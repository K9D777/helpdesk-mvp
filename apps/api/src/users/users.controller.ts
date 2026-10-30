import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('ADMIN', 'TECHNICIAN')
  async getUsers(@Query('department') department?: string) {
    return this.prisma.user.findMany({
      where: department ? { department } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'TECHNICIAN', 'REQUESTER')
  async getUser(@Param('id') id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
