import { IsString, IsNotEmpty, IsObject, IsOptional, IsISO8601, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { LocalizedStringDto } from '../../dto/localized.dto';

export class CreatePostDto {
    @Transform(({ value }) => value === '' ? null : value)
    @IsOptional()
    @IsISO8601({ strict: true })
    @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/, { message: 'deadline must include a time and timezone' })
    deadline?: string | null;

    @IsObject()
    name: LocalizedStringDto;

    @IsObject()
    description: LocalizedStringDto;

    @IsString()
    @IsNotEmpty()
    urlForm: string;
}
