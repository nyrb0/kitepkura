// post.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import * as fs from 'fs/promises';
import { createPostSlug } from '../../utils/post-slug';

@Injectable()
export class PostService {
    constructor(private readonly prisma: PrismaService) {}

    async create(dto: CreatePostDto, files: Express.Multer.File[]) {
        const post = await this.prisma.post.create({
            data: {
                slug: createPostSlug(dto.name.ru),
                name: { ...dto.name },
                description: { ...dto.description },
                urlForm: dto.urlForm,
                postFiles: files?.length
                    ? {
                          create: files.map(file => ({
                              original_name: file.originalname,
                              mime_type: file.mimetype,
                              size: file.size,
                              path: file.path,
                          })),
                      }
                    : undefined,
            },
            include: { postFiles: true },
        });

        return post;
    }

    async findAll(page = 1, limit = 10, isArchive?: boolean) {
        const skip = (page - 1) * limit;

        // Формируем фильтр: если isArchive передан (boolean), фильтруем по нему, иначе — undefined (Prisma проигнорирует)
        const where = {
            ...(typeof isArchive === 'boolean' && { isArchive }),
        };

        const [items, total] = await this.prisma.$transaction([
            this.prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    postFiles: true,
                    _count: {
                        select: { views: true },
                    },
                },
            }),
            this.prisma.post.count({ where }),
        ]);

        const formattedItems = items.map(({ _count, ...post }: { _count: { views: number } } & Record<string, any>) => ({
            ...post,

            viewsCount: _count.views,
        }));

        return {
            data: formattedItems,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async trackUrlClick(slug: string) {
        return this.prisma.post.update({
            where: { slug },
            data: {
                urlClicks: { increment: 1 }, // Увеличивает значение на 1 в БД
            },
            select: { urlForm: true, urlClicks: true },
        });
    }

    async findBySlug(slug: string) {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            include: {
                postFiles: true,
                _count: {
                    select: { views: true },
                },
            },
        });

        if (!post) {
            throw new NotFoundException(`Пост со slug "${slug}" не найден`);
        }

        // Вытаскиваем _count и формируем итоговый объект
        const { _count, ...postData } = post;

        return {
            ...postData,
            viewsCount: _count.views,
        };
    }

    async update(slug: string, dto: UpdatePostDto, files?: Express.Multer.File[]) {
        const post = await this.findBySlug(slug);

        const updated = await this.prisma.post.update({
            where: { id: post.id },
            data: {
                name: dto.name ? { ...dto.name } : undefined,
                isArchive: dto.isArchive ?? false,
                urlForm: dto.urlForm ?? undefined,
                description: dto.description ? { ...dto.description } : undefined,
                postFiles: files?.length
                    ? {
                          create: files.map(file => ({
                              original_name: file.originalname,
                              mime_type: file.mimetype,
                              size: file.size,
                              path: file.path,
                              created_at: new Date(),
                              updated_at: new Date(),
                          })),
                      }
                    : undefined,
            },
            include: { postFiles: true },
        });

        return updated;
    }

    async remove(slug: string) {
        const post = await this.findBySlug(slug);

        for (const doc of post.postFiles) {
            try {
                // Кастуем doc к любому объекту, у которого есть path
                const { path: filePath } = doc as { path: string };
                await fs.unlink(filePath);
            } catch (err) {
                const error = err as Error;

                console.warn(`Не удалось удалить файл`, error.message);
            }
        }

        await this.prisma.post.delete({ where: { id: post.id } });

        return { message: 'Пост успешно удалён' };
    }

    async getTopViewedPosts() {
        try {
            // Запускаем оба запроса параллельно
            const [posts, activeCount] = await Promise.all([
                // 1. Топ-3 по просмотрам среди неархивных
                this.prisma.post.findMany({
                    where: { isArchive: false },
                    take: 3,
                    orderBy: {
                        views: {
                            _count: 'desc',
                        },
                    },
                    select: {
                        id: true,
                        slug: true,
                        name: true,
                        description: true,
                        urlClicks: true,
                        createdAt: true,
                        _count: {
                            select: { views: true },
                        },
                    },
                }),

                // 2. Подсчет общего количества активных постов
                this.prisma.post.count({
                    where: { isArchive: false },
                }),
            ]);

            // Маппим просмотры в плоское поле viewsCount
            const topPosts = posts.map(({ _count, ...post }) => ({
                ...post,
                viewsCount: _count.views,
            }));

            return {
                activeCount, // Общее число активных постов
                topPosts, // Массив из 3 популярных постов
            };
        } catch (error) {
            console.error('Error fetching post stats:', error);
            throw new InternalServerErrorException('Не удалось получить статистику постов');
        }
    }
}
