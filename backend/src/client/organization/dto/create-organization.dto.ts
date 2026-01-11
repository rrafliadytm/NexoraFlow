import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  locale: string;

  @IsEmail()
  contact_email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'contact_phone must be in E.164 format (e.g. +14155552671)',
  })
  contact_phone: string;

  @IsOptional()
  logo?: BinaryType;
}
