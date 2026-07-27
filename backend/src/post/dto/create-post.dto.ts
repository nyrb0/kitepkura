import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { LocalizedStringDto } from '../../dto/localized.dto';

export class CreatePostDto {
    @IsObject()
    name: LocalizedStringDto;

    @IsObject()
    description: LocalizedStringDto;

    @IsString()
    @IsNotEmpty()
    urlForm: string;
}
