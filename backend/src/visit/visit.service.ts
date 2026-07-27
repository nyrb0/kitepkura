import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface VisitStats {
    today: number; // За сегодня (с 00:00)
    yesterday: number; // За вчера
    last7Days: number; // За последние 7 дней
    last30Days: number; // За последние 30 дней
    total: number; // За все время
}

@Injectable()
export class VisitService {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * 1. Метод для фиксации визита (вызывать в Middleware или Interceptor)
     */
    async trackVisit(ip?: string, userAgent?: string, path?: string) {
        // Если IP не пришел (например, локальная разработка или прокси сбросил заголовок)
        const clientIp = ip || 'unknown';

        // Форматируем дату в YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        return this.prisma.visit.upsert({
            where: {
                ip_date: {
                    ip: clientIp,
                    date: today,
                },
            },
            // Если визит за сегодня уже был — обновляем последнюю посещенную страницу
            update: {
                path,
                userAgent,
            },
            // Если это первый визит IP за сегодня — создаем новую запись
            create: {
                ip: clientIp,
                userAgent,
                path,
                date: today,
            },
        });
    }
    /**
     * 2. Метод для получения статистики посещений
     */
    async getStats(): Promise<VisitStats> {
        const now = new Date();

        // Начало сегодняшнего дня (00:00:00.000)
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Начало вчерашнего дня
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        // 7 дней назад (включая сегодня)
        const sevenDaysAgo = new Date(startOfToday);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        // 30 дней назад (включая сегодня)
        const thirtyDaysAgo = new Date(startOfToday);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

        // Параллельно выполняем все запросы к БД для высокой скорости
        const [today, yesterday, last7Days, last30Days, total] = await Promise.all([
            // Сегодня
            this.prisma.visit.count({
                where: { createdAt: { gte: startOfToday } },
            }),
            // Вчера
            this.prisma.visit.count({
                where: {
                    createdAt: {
                        gte: startOfYesterday,
                        lt: startOfToday,
                    },
                },
            }),
            // За последние 7 дней
            this.prisma.visit.count({
                where: { createdAt: { gte: sevenDaysAgo } },
            }),
            // За последние 30 дней
            this.prisma.visit.count({
                where: { createdAt: { gte: thirtyDaysAgo } },
            }),
            // За все время
            this.prisma.visit.count(),
        ]);

        return {
            today,
            yesterday,
            last7Days,
            last30Days,
            total,
        };
    }
}
