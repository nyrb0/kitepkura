import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

describe('Post deadlines', () => {
    const now = new Date('2026-09-14T06:00:00.000Z');
    const prisma = {
        post: {
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve(data)),
            update: jest.fn().mockImplementation(({ data }) => Promise.resolve(data)),
            findUnique: jest.fn(),
        },
    };
    let service: PostService;

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(now);
        jest.clearAllMocks();
        service = new PostService(prisma as unknown as PrismaService);
        prisma.post.findUnique.mockResolvedValue({
            id: 'post-id', deadline: now, isArchive: true, postFiles: [], _count: { views: 0 },
        });
    });

    afterEach(() => {
        service.onModuleDestroy();
        jest.useRealTimers();
    });

    it.each([
        [undefined, false],
        [null, false],
        ['2026-09-14T12:01:00+06:00', false],
        ['2026-09-14T12:00:00+06:00', true],
        ['2026-09-14T11:59:00+06:00', true],
    ])('archives on creation according to deadline %s', async (deadline, archived) => {
        const result = await service.create({
            name: { ru: 'Test', kg: 'Test' }, description: { ru: 'Test', kg: 'Test' },
            urlForm: 'https://example.com', deadline,
        }, []);
        expect(result.isArchive).toBe(archived);
    });

    it('checks on startup, every minute, and stops on shutdown', async () => {
        await service.onModuleInit();
        expect(prisma.post.updateMany).toHaveBeenCalledWith({
            where: { isArchive: false, deadline: { lte: now } }, data: { isArchive: true },
        });
        await jest.advanceTimersByTimeAsync(60_000);
        expect(prisma.post.updateMany).toHaveBeenCalledTimes(2);
        service.onModuleDestroy();
        await jest.advanceTimersByTimeAsync(60_000);
        expect(prisma.post.updateMany).toHaveBeenCalledTimes(2);
    });

    it('does not silently unarchive an edited post or remove its deadline', async () => {
        const result = await service.update('test', { urlForm: 'https://example.com' });
        expect(result.isArchive).toBe(true);
        expect(result.deadline).toBeUndefined();
    });

    it('keeps expired posts archived even when restoration is requested', async () => {
        const result = await service.update('test', { isArchive: false });
        expect(result.isArchive).toBe(true);
    });

    it('allows clearing the deadline and restoring explicitly', async () => {
        const result = await service.update('test', { deadline: null, isArchive: false });
        expect(result.deadline).toBeNull();
        expect(result.isArchive).toBe(false);
    });

    it('allows postponing the deadline and restoring explicitly', async () => {
        const result = await service.update('test', { deadline: '2026-09-15T12:00:00+06:00', isArchive: false });
        expect(result.deadline).toEqual(new Date('2026-09-15T06:00:00Z'));
        expect(result.isArchive).toBe(false);
    });

    it('archives before returning a post', async () => {
        await service.findBySlug('test');
        expect(prisma.post.updateMany.mock.invocationCallOrder[0]).toBeLessThan(prisma.post.findUnique.mock.invocationCallOrder[0]);
    });

    it.each(['not-a-date', '2026-02-30T12:00:00Z', '2026-09-14', '2026-09-14T12:00:00'])('rejects invalid or ambiguous date %s', async deadline => {
        const errors = await validate(plainToInstance(UpdatePostDto, { deadline }));
        expect(errors.some(error => error.property === 'deadline')).toBe(true);
    });

    it.each([undefined, null, '', '2026-09-14T12:00:00+06:00'])('accepts optional / timezone-qualified deadline %s', async deadline => {
        const dto = plainToInstance(UpdatePostDto, { deadline });
        expect(await validate(dto)).toHaveLength(0);
        if (deadline === '') expect(dto.deadline).toBeNull();
    });
});
