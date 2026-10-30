import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsString({ message: 'O título do chamado é obrigatório.' })
  title: string;

  @IsString({ message: 'A descrição do chamado é obrigatória.' })
  description: string;

  @IsOptional()
  @IsUUID('4', { each: false, message: 'O id do solicitante deve ser um UUID válido.' })
  requesterId?: string;

  @IsOptional()
  @IsUUID('4', { each: false, message: 'O id da fila deve ser um UUID válido.' })
  queueId?: string;

  @IsOptional()
  @IsUUID('4', { each: false, message: 'O id da categoria deve ser um UUID válido.' })
  categoryId?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  urgency?: number;

  @IsOptional()
  impact?: number;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
