import { IPost, IPostsResponse } from '@/entities/models/post.types';
import HomeContent from './HomeContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPosts(): Promise<IPost[]> {
    const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${apiUrl}/posts?page=1&limit=30&isArchive=false`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Не удалось загрузить список сынактар');
    }

    const json: IPostsResponse = await res.json();

    return json.data;
}

export default async function Home() {
    const posts = await getPosts();

    return <HomeContent posts={posts} />;
}
