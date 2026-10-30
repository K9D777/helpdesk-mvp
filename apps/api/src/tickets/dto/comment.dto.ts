import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CommentDto {
  @IsString({ message: 'O comentário deve ser informado.' })
  @MinLength(1, { message: 'O comentário não pode estar vazio.' })
  body: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo isInternal deve ser booleano.' })
  isInternal?: boolean;
}
