import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { PostModule } from './post/post.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { VisitModule } from './visit/visit.module';

@Module({
    imports: [PrismaModule, PostModule, AuthModule, ConfigModule.forRoot({ isGlobal: true }), VisitModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
