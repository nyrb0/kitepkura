import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PostViewService } from './post-view.service';

@Module({
    controllers: [PostController],
    providers: [PostService, PrismaService, PostViewService],
})
export class PostModule {}
