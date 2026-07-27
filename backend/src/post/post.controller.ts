// post.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    Query,
    UseInterceptors,
    UploadedFiles,
    ParseIntPipe,
    DefaultValuePipe,
    Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { pdfFileFilter } from '../../utils/pdf-file.filter';
import { PostViewService } from './post-view.service';
import { Request } from 'express';
import { Auth } from '../auth/decorator/auth.decorator';

const multerOptions = {
    storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, callback) => {
            const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
            callback(null, uniqueName);
        },
    }),
    fileFilter: pdfFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
};
function extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress ?? req.ip ?? 'unknown';
}

@Controller('posts')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly postViewService: PostViewService,
    ) {}

    @Auth()
    @Post()
    @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
    create(@Body() dto: CreatePostDto, @UploadedFiles() files: Express.Multer.File[]) {
        return this.postService.create(dto, files);
    }

    @Post(':slug/click-url')
    async clickUrl(@Param('slug') slug: string) {
        return this.postService.trackUrlClick(slug);
    }

    @Get()
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('isArchive') isArchive?: string, // Получаем параметр из URL
    ) {
        // Преобразуем строковый 'true'/'false' в boolean, если параметр был передан
        const isArchiveBool = isArchive !== undefined ? isArchive === 'true' : false;

        return this.postService.findAll(page, limit, isArchiveBool);
    }

    @Auth()
    @Get('top-viewed')
    async getTopViewed() {
        return this.postService.getTopViewedPosts();
    }

    @Get(':slug')
    findBySlug(@Param('slug') slug: string) {
        return this.postService.findBySlug(slug);
    }

    @Post('register-view/:slug')
    registerView(@Param('slug') slug: string, @Req() req: Request) {
        const userIp = extractIp(req);
        return this.postViewService.registerView(slug, userIp);
    }

    @Auth()
    @Patch(':slug')
    @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
    update(@Param('slug') slug: string, @Body() dto: UpdatePostDto, @UploadedFiles() files: Express.Multer.File[]) {
        return this.postService.update(slug, dto, files);
    }

    @Auth()
    @Delete(':slug')
    remove(@Param('slug') slug: string) {
        return this.postService.remove(slug);
    }

    @Auth()
    @Get(':slug/stats')
    async getStats(@Param('slug') slug: string) {
        return this.postViewService.getPostStatsBySlug(slug);
    }
}
