import { notFound } from 'next/navigation';

import { IPost } from '@/entities/models/post.types';
import PostDetailContent from './PostDetailContent';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getPostBySlug(slug: string): Promise<IPost | null> {
    const apiUrl = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${apiUrl}/posts/${slug}`, {
        cache: 'no-store',
    });

    if (res.status === 404) return null;

    if (!res.ok) {
        throw new Error('Не удалось загрузить конкурс');
    }

    return res.json();
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;

    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: 'Конкурс табылган жок | Kitepkura',
        };
    }

    return {
        title: `${post.name.ru} | Kitepkura`,
        description: post.description.ru,
    };
}

export default async function DetailPage({ params }: PageProps) {
    const { slug } = await params;

    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return <PostDetailContent post={post} slug={slug} />;
}
