// dto/update-post.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdatePostDto extends PartialType(CreatePostDto) {
    @IsString()
    @IsOptional()
    archive_description: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true' || value === true) return true;
        if (value === 'false' || value === false) return false;

        return value;
    })
    @IsBoolean()
    isArchive?: boolean;
}
