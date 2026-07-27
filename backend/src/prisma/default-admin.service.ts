import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from './prisma.service';

@Injectable()
export class DefaultAdminService implements OnApplicationBootstrap {
    private readonly logger = new Logger(DefaultAdminService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {}

    async onApplicationBootstrap() {
        const email = this.configService.get<string>('ADMIN_EMAIL');
        const password = this.configService.get<string>('ADMIN_PASSWORD');

        if (!email || !password) {
            this.logger.warn('ADMIN_EMAIL or ADMIN_PASSWORD is not set. Default admin was not created.');
            return;
        }

        const existingAdmin = await this.prisma.admins.findUnique({
            where: { email },
            select: { id: true },
        });

        if (existingAdmin) {
            return;
        }

        const hashedPassword = (await argon2.hash(password)) as string;
        const now = new Date();

        await this.prisma.admins.create({
            data: {
                email,
                password: hashedPassword,
                createdAt: now,
                updatedAt: now,
            },
        });

        this.logger.log(`Default admin created: ${email}`);
    }
}
