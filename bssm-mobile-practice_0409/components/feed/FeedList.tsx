import { FlatList } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    SharedValue,
} from 'react-native-reanimated';
import { Post } from '@type/Post';
import { SwipeableFeedPost } from './post/SwipeableFeedPost';
import { useFeedStore } from '@/store/feed-store';

// 실습 6-1: AnimatedFlatList 만들기
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

function FeedList({
    posts,
    onEndReached,
    scrollY,
}: {
    posts: Post[];
    onEndReached?: () => void;
    scrollY?: SharedValue<number>;
}) {
    const { removePost } = useFeedStore();

    // 실습 6-2: scrollHandler 정의
    const scrollHandler = useAnimatedScrollHandler(event => {
        if (scrollY) {
            scrollY.value = event.contentOffset.y;
        }
    });

    return (
        // 실습 6-3: onScroll + scrollEventThrottle 연결
        <AnimatedFlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <SwipeableFeedPost post={item} onDelete={removePost} />
            )}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
        />
    );
}

export { FeedList };
