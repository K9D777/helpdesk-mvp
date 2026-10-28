import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
