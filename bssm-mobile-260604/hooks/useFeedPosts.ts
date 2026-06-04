import { useCallback, useMemo } from 'react';
import { useFeedStore } from '@/store/feed-store';

export function useFeedPosts(keyword = '') {
    const posts = useFeedStore(s => s.posts);
    const loading = useFeedStore(s => s.loading);
    const error = useFeedStore(s => s.error);
    const fetchFeed = useFeedStore(s => s.fetchFeed);
    const loadMore = useFeedStore(s => s.loadMore);
    const toggleLike = useFeedStore(s => s.toggleLike);

    const filteredPosts = useMemo(() => {
        const query = keyword.trim().toLowerCase();

        if (!query) return posts;

        return posts.filter(post => {
            const caption = post.caption.toLowerCase();
            const username = post.author?.username.toLowerCase() ?? '';

            return caption.includes(query) || username.includes(query);
        });
    }, [keyword, posts]);

    const handleLike = useCallback(
        (id: string) => {
            toggleLike(id);
        },
        [toggleLike],
    );

    return {
        posts,
        filteredPosts,
        loading,
        error,
        fetchFeed,
        loadMore,
        handleLike,
    };
}
