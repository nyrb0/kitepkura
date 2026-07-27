import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Проверь правильность пути к твоему PrismaService
import * as argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async login(dto: LoginDto) {
        const admin = await this.prisma.admins.findUnique({
            where: { email: dto.email },
        });

        if (!admin) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        const isPasswordMatches = await argon2.verify(admin.password, dto.password);

        if (!isPasswordMatches) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        const payload = { sub: admin.id, email: admin.email };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            admin: {
                id: admin.id,
                email: admin.email,
            },
        };
    }
}
