import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(4, { message: 'A senha deve ter pelo menos 4 caracteres.' })
  password: string;
}
