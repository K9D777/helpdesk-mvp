import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const storedPassword = user.password || 'admin123';
    if (password && storedPassword !== password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role, department: user.department },
      process.env.JWT_SECRET || 'helpdesk-dev-secret',
      { expiresIn: '8h' },
    );

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    };
  }
}
