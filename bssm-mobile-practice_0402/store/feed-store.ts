import { getFeed } from '@/api/content';
import { Post } from '@type/Post';
import { create } from 'zustand';
import { likePost, unlikePost } from '@/api/content';

interface FeedState {
    posts: Post[];
    page: number;
    hasNext: boolean;
    loading: boolean;
    error: string | null;

    fetchFeed: () => Promise<void>;
    loadMore: () => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
    posts: [],
    page: 1,
    hasNext: false,
    loading: false,
    error: null,

    fetchFeed: async () => {
        // TODO: (4차) set()으로 loading을 켜고, getFeed(1)를 호출해 posts/pagination을 저장한다
        // 힌트: try/catch로 감싸고 실패 시 error 메시지도 저장한다
        set({ loading: true });
        try {
            const { data, pagination } = await getFeed(1);
            set({
                posts: data,
                page: 1,
                hasNext: pagination.hasNext,
                loading: false,
                error: null,
            });
        } catch {
            set({
                loading: false,
                error: '피드를 불러오지 못했습니다.',
            });
        }
    },

    loadMore: async () => {
        const { loading, hasNext, page, posts } = get();
        if (loading || !hasNext) return;

        set({ loading: true });
        try {
            const nextPage = page + 1;
            const { data, pagination } = await getFeed(nextPage);
            set({
                posts: [...posts, ...data],
                page: nextPage,
                hasNext: pagination.hasNext,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    // 낙관적 업데이트: UI를 먼저 바꾸고 API 호출 → 실패 시 원상복구
    toggleLike: async (postId: string) => {
        const { posts } = get();
        const target = posts.find(p => p.id === postId);
        if (!target) return;

        const wasLiked = Boolean(target.liked);
        const previousPost = { ...target };

        set(state => ({
            posts: state.posts.map(p =>
                p.id === postId
                    ? {
                          ...p,
                          likes: wasLiked
                              ? Math.max(0, p.likes - 1)
                              : p.likes + 1,
                          liked: !wasLiked,
                      }
                    : p,
            ),
        }));

        try {
            const result = wasLiked
                ? await unlikePost(postId)
                : await likePost(postId);
            set(state => ({
                posts: state.posts.map(p =>
                    p.id === postId
                        ? { ...p, likes: result.likes, liked: result.liked }
                        : p,
                ),
            }));
        } catch {
            set({
                posts: get().posts.map(p =>
                    p.id === postId ? previousPost : p,
                ),
            });
        }
    },
}));
