import { IPostsResponse } from '@/entities/models/post.types';
import HomeContent from '../HomeContent';

export const dynamic = 'force-dynamic';

export default async function ClosedCompetitions({
    searchParams,
}: {
    searchParams: Promise<{ page?: string | string[] }>;
}) {
    const { page: requestedPage } = await searchParams;
    const parsedPage = Number(requestedPage);
    const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/posts?page=${page}&limit=30&isArchive=true`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Не удалось загрузить архив конкурсов');
    }

    const { data, meta }: IPostsResponse = await res.json();

    return <HomeContent posts={data} archive pagination={meta} />;
}
