import { IsString, IsNotEmpty } from 'class-validator';

export class LocalizedStringDto {
    @IsString()
    @IsNotEmpty()
    ru: string;

    @IsString()
    @IsNotEmpty()
    kg: string;
}
