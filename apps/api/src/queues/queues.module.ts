import { Module } from '@nestjs/common';
import { QueuesController } from './queues.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QueuesController],
})
export class QueuesModule {}
