import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { DefaultAdminService } from './default-admin.service';

@Module({
    imports: [ConfigModule],
    providers: [PrismaService, DefaultAdminService],
    exports: [PrismaService], // обязательно экспортируем
})
export class PrismaModule {}
