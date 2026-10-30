import { IsIn, IsString } from 'class-validator';

export class UpdateStatusDto {
  @IsString({ message: 'O status deve ser informado.' })
  @IsIn(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], {
    message: 'Status inválido. Valores permitidos: NEW, IN_PROGRESS, RESOLVED, CLOSED.',
  })
  status: string;
}
