import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Post } from '@type/Post';
import ContentContainer from '@components/container';
import { FeedPostHeader } from './FeedPostHeader';
import { FeedPostActions } from './FeedPostActions';
import { FeedPostCaption } from './FeedPostCaption';
import { ThemedView } from '@components/themed-view';
import FeedImage from '@components/feed/post/FeedImage';
import { resolveImageSource } from '@/utils/image';
import { useFeedStore } from '@/store/feed-store';

const FeedPost = memo(function FeedPost({ post }: { post: Post }) {
    console.log('FeedPost render:', post.id);

    const user = post.author;

    const liked = useFeedStore(
        s => s.posts.find(p => p.id === post.id)?.liked ?? post.liked ?? false,
    );
    const toggleLike = useFeedStore(s => s.toggleLike);

    const handleDoubleTap = useCallback(() => {
        if (!liked) toggleLike(post.id);
    }, [liked, post.id, toggleLike]);

    if (!user) return null;

    return (
        <ThemedView style={styles.feedMargin}>
            <FeedPostHeader user={user} />
            {post.images[0] && (
                <FeedImage
                    image={resolveImageSource(post.images[0])}
                    onDoubleTap={handleDoubleTap}
                />
            )}
            <ContentContainer style={{ gap: 4 }}>
                <FeedPostActions
                    postId={post.id}
                    initialLikes={post.likes}
                    initialLiked={post.liked}
                    commentCount={post.commentCount ?? post.comments.length}
                />
                <FeedPostCaption
                    username={user.username}
                    caption={post.caption}
                    timestamp={post.timestamp}
                />
            </ContentContainer>
        </ThemedView>
    );
});

const styles = StyleSheet.create({
    feedMargin: {
        marginBottom: 20,
    },
});

export { FeedPost };
