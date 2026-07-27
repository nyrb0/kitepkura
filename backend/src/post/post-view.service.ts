import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PostViewService {
    constructor(private readonly prisma: PrismaService) {}

    async registerView(slug: string, userIp: string) {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!post) {
            throw new NotFoundException(`Пост со slug "${slug}" не найден`);
        }

        try {
            await this.prisma.post_view.create({
                data: {
                    post_id: post.id,
                    user_ip: userIp,
                },
            });

            return {
                counted: true,
                message: 'Просмотр засчитан',
            };
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                return {
                    counted: false,
                    message: 'Просмотр с этого IP уже был засчитан ранее',
                };
            }
            throw error;
        }
    }
    async getPostStatsBySlug(slug: string) {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            include: {
                postFiles: true, // Загружаем связанные файлы, если нужно
            },
        });

        if (!post) {
            throw new NotFoundException(`Пост со slug "${slug}" не найден`);
        }

        // Даты и границы интервалов
        const now = new Date();

        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Параллельный подсчет просмотров за разные периоды
        const [today, yesterday, last7Days, last30Days, total] = await Promise.all([
            // За сегодня (с 00:00)
            this.prisma.post_view.count({
                where: {
                    post_id: post.id,
                    createdAt: { gte: startOfToday },
                },
            }),

            // За вчера (с 00:00 вчера до 00:00 сегодня)
            this.prisma.post_view.count({
                where: {
                    post_id: post.id,
                    createdAt: {
                        gte: startOfYesterday,
                        lt: startOfToday,
                    },
                },
            }),

            // За последние 7 дней
            this.prisma.post_view.count({
                where: {
                    post_id: post.id,
                    createdAt: { gte: sevenDaysAgo },
                },
            }),

            // За последние 30 дней
            this.prisma.post_view.count({
                where: {
                    post_id: post.id,
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),

            // Всего за все время
            this.prisma.post_view.count({
                where: { post_id: post.id },
            }),
        ]);

        return {
            post,
            stats: {
                today,
                yesterday,
                last7Days,
                last30Days,
                total,
            },
        };
    }
}
